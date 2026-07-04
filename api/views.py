import datetime
import os
import uuid
from django.shortcuts import render
from django.db import IntegrityError
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from api.models import CustomUser, Attendance, LeaveRequest
from api.serializers import CustomUserSerializer, AttendanceSerializer, LeaveRequestSerializer
from api.permissions import IsAdmin, IsEmployee, IsAdminOrSelf
from api.utils import generate_token

# Frontend Entry point View
def index_view(request):
    return render(request, 'api/index.html')

# API Views

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        employee_id = data.get('employee_id')
        full_name = data.get('full_name')

        if not email or not password or not employee_id or not full_name:
            return Response({'error': 'Please provide email, password, employee ID, and full name.'}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce secure password rule
        if len(password) < 8 or not any(char.isdigit() for char in password) or not any(char.isalpha() for char in password):
            return Response({'error': 'Password must be at least 8 characters long and contain both letters and numbers.'}, status=status.HTTP_400_BAD_REQUEST)

        # Look up pre-registered user matching both email and employee ID
        try:
            user = CustomUser.objects.get(email=email, employee_id=employee_id)
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Your email and Employee ID are not pre-registered in the system. Please ask your HR Admin to register you first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if password is already set
        if user.has_usable_password():
            return Response({'error': 'This employee account has already been registered.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Set the password and activate account
            user.set_password(password)
            user.full_name = full_name
            user.is_active = True
            user.save()

            mock_verification = f"Verification confirmed for pre-registered email {email}. Account activated."
            serializer = CustomUserSerializer(user)
            return Response({
                'message': 'Registration successful. You can now sign in.',
                'verification': mock_verification,
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SigninView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both email and password.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        token = generate_token(user)
        user_serializer = CustomUserSerializer(user)

        response = Response({
            'message': 'Sign in successful.',
            'token': token,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)

        # Set HTTP-Only Cookie for direct template authentication convenience
        response.set_cookie(
            key='jwt',
            value=token,
            httponly=True,
            samesite='Lax',
            max_age=7 * 24 * 3600 # 7 days
        )
        return response

class SignoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'message': 'Sign out successful.'}, status=status.HTTP_200_OK)
        response.delete_cookie('jwt')
        return response

class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            instance = serializer.save()
            # Auto-lock personal info once employee has set phone, address AND profile picture
            if (
                not instance.personal_info_locked and
                instance.phone and instance.phone.strip() and
                instance.address and instance.address.strip() and
                instance.profile_picture_url and instance.profile_picture_url.strip()
            ):
                instance.personal_info_locked = True
                instance.save(update_fields=['personal_info_locked'])
            return Response(CustomUserSerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = CustomUser.objects.all().order_by('full_name')
        serializer = CustomUserSerializer(employees, many=True)
        return Response(serializer.data)

class EmployeeProfileDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        try:
            employee = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomUserSerializer(employee)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            employee = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()

        # Admin can NEVER change personal fields — only the employee can update these
        for employee_only_field in ('phone', 'address', 'profile_picture_url', 'gender'):
            data.pop(employee_only_field, None)

        serializer = CustomUserSerializer(employee, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AttendanceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'Admin':
            # Admin can view all or filter by employee
            employee_id = request.query_params.get('employee_id')
            if employee_id:
                attendances = Attendance.objects.filter(employee_id=employee_id)
            else:
                attendances = Attendance.objects.all()
        else:
            # Employee only views their own
            attendances = Attendance.objects.filter(employee=request.user)

        # Filter by start/end date if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            attendances = attendances.filter(date__gte=start_date)
        if end_date:
            attendances = attendances.filter(date__lte=end_date)

        attendances = attendances.order_by('-date')
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

class AttendanceClockToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # We assume clocking operates on the server's current date and time
        now = datetime.datetime.now()
        today = now.date()
        current_time = now.time()

        attendance, created = Attendance.objects.get_or_create(
            employee=request.user,
            date=today,
            defaults={'status': 'Present', 'check_in': current_time}
        )

        if created:
            return Response({
                'message': 'Successfully clocked in.',
                'attendance': AttendanceSerializer(attendance).data
            }, status=status.HTTP_201_CREATED)

        if not attendance.check_out:
            attendance.check_out = current_time
            # Calculate duration to check if it's a half-day
            try:
                in_time = datetime.datetime.combine(today, attendance.check_in)
                out_time = datetime.datetime.combine(today, current_time)
                duration = out_time - in_time
                hours = duration.total_seconds() / 3600.0
                if hours < 4.0:
                    attendance.status = 'Half-day'
                else:
                    attendance.status = 'Present'
            except Exception:
                attendance.status = 'Present'

            attendance.save()
            return Response({
                'message': 'Successfully clocked out.',
                'attendance': AttendanceSerializer(attendance).data
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Already clocked out for today.',
            'attendance': AttendanceSerializer(attendance).data
        }, status=status.HTTP_400_BAD_REQUEST)

class LeaveRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'Admin':
            # Admin views all
            requests = LeaveRequest.objects.all()
        else:
            # Employee views their own
            requests = LeaveRequest.objects.filter(employee=request.user)

        requests = requests.order_by('-start_date')
        serializer = LeaveRequestSerializer(requests, many=True)
        return Response(serializer.data)

class LeaveRequestApplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        leave_type = data.get('leave_type')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        reason = data.get('reason', '')

        if not leave_type or not start_date_str or not end_date_str:
            return Response({'error': 'Please provide leave type, start date, and end date.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        if start_date > end_date:
            return Response({'error': 'Start date must be before or equal to end date.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for overlapping leave requests (Pending or Approved)
        overlap = LeaveRequest.objects.filter(
            employee=request.user,
            status__in=['Pending', 'Approved']
        ).filter(
            start_date__lte=end_date,
            end_date__gte=start_date
        ).exists()

        if overlap:
            return Response({'error': 'You already have an overlapping leave request that is pending or approved.'}, status=status.HTTP_400_BAD_REQUEST)

        leave = LeaveRequest.objects.create(
            employee=request.user,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            reason=reason
        )

        return Response({
            'message': 'Leave request submitted successfully.',
            'leave': LeaveRequestSerializer(leave).data
        }, status=status.HTTP_201_CREATED)

class LeaveRequestApproveView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            leave = LeaveRequest.objects.get(pk=pk)
        except LeaveRequest.DoesNotExist:
            return Response({'error': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('status') # 'Approved' or 'Rejected'
        comments = request.data.get('admin_comments', '')

        if action not in ['Approved', 'Rejected']:
            return Response({'error': 'Invalid action. Use Approved or Rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        leave.status = action
        leave.admin_comments = comments
        leave.save()

        # If Approved, update Attendance logs instantly
        if action == 'Approved':
            current_date = leave.start_date
            while current_date <= leave.end_date:
                # Update or create attendance record with 'Leave' status
                Attendance.objects.update_or_create(
                    employee=leave.employee,
                    date=current_date,
                    defaults={
                        'status': 'Leave',
                        'check_in': None,
                        'check_out': None
                    }
                )
                current_date += datetime.timedelta(days=1)

        return Response({
            'message': f'Leave request successfully {action.lower()}ed.',
            'leave': LeaveRequestSerializer(leave).data
        }, status=status.HTTP_200_OK)

class LeaveRequestCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            if request.user.role == 'Admin':
                leave = LeaveRequest.objects.get(pk=pk)
            else:
                leave = LeaveRequest.objects.get(pk=pk, employee=request.user)
        except LeaveRequest.DoesNotExist:
            return Response({'error': 'Leave request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if leave.status in ['Rejected', 'Cancelled']:
            return Response({'error': f'Cannot cancel a leave request that is already {leave.status.lower()}.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = leave.status
        leave.status = 'Cancelled'
        leave.save()

        if old_status == 'Approved':
            current_date = leave.start_date
            while current_date <= leave.end_date:
                Attendance.objects.filter(
                    employee=leave.employee,
                    date=current_date,
                    status='Leave'
                ).delete()
                current_date += datetime.timedelta(days=1)

        return Response({
            'message': 'Leave request successfully cancelled.',
            'leave': LeaveRequestSerializer(leave).data
        }, status=status.HTTP_200_OK)

class PayrollListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'Admin':
            # Admin sees all employees' payroll breakdowns
            employees = CustomUser.objects.all().order_by('full_name')
            data = []
            for emp in employees:
                base = float(emp.salary_base)
                allowances = float(emp.salary_allowances)
                deductions = float(emp.salary_deductions)
                net = base + allowances - deductions
                data.append({
                    'id': emp.id,
                    'employee_id': emp.employee_id,
                    'full_name': emp.full_name,
                    'job_title': emp.job_title,
                    'salary_base': base,
                    'salary_allowances': allowances,
                    'salary_deductions': deductions,
                    'net_pay': net
                })
            return Response(data)
        else:
            # Employee views their own read-only breakdown
            emp = request.user
            base = float(emp.salary_base)
            allowances = float(emp.salary_allowances)
            deductions = float(emp.salary_deductions)
            net = base + allowances - deductions
            return Response({
                'employee_id': emp.employee_id,
                'full_name': emp.full_name,
                'job_title': emp.job_title,
                'salary_base': base,
                'salary_allowances': allowances,
                'salary_deductions': deductions,
                'net_pay': net
            })

class PayrollUpdateView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        try:
            employee = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        salary_base = data.get('salary_base')
        salary_allowances = data.get('salary_allowances')
        salary_deductions = data.get('salary_deductions')

        if salary_base is not None:
            employee.salary_base = salary_base
        if salary_allowances is not None:
            employee.salary_allowances = salary_allowances
        if salary_deductions is not None:
            employee.salary_deductions = salary_deductions

        employee.save()
        serializer = CustomUserSerializer(employee)
        return Response({
            'message': 'Salary structure updated successfully.',
            'user': serializer.data
        })

class ProfilePictureUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        content_type = uploaded_file.content_type
        if not content_type.startswith('image/'):
            return Response({'error': 'Uploaded file is not a valid image.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(uploaded_file.name)[1]
        filename = f"{uuid.uuid4()}{ext}"

        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'profile_pics'))
        saved_name = fs.save(filename, uploaded_file)
        file_url = f"/media/profile_pics/{saved_name}"

        return Response({
            'message': 'File uploaded successfully.',
            'url': file_url
        }, status=status.HTTP_201_CREATED)

class EmployeeCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data
        email = data.get('email')
        employee_id = data.get('employee_id')
        full_name = data.get('full_name')
        role = data.get('role', 'Employee')
        job_title = data.get('job_title', '')
        phone = data.get('phone', '')
        gender = data.get('gender', '')
        address = data.get('address', '')
        profile_picture_url = data.get('profile_picture_url', '')

        if not email or not employee_id or not full_name:
            return Response({'error': 'Please provide email, employee ID, and full name.'}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'An employee with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(employee_id=employee_id).exists():
            return Response({'error': 'An employee with this Employee ID already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create user without password (unusable password)
            user = CustomUser.objects.create_user(
                email=email,
                password=None,
                employee_id=employee_id,
                role=role,
                full_name=full_name,
                job_title=job_title,
                phone=phone,
                gender=gender,
                address=address,
                profile_picture_url=profile_picture_url
            )
            user.set_unusable_password()
            user.save()

            serializer = CustomUserSerializer(user)
            return Response({
                'message': 'Employee pre-registered successfully.',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
