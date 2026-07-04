from rest_framework import serializers
from api.models import CustomUser, Attendance, LeaveRequest

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'employee_id', 'email', 'role', 'full_name',
            'phone', 'gender', 'address', 'job_title', 'salary_base',
            'salary_allowances', 'salary_deductions',
            'profile_picture_url', 'documents', 'personal_info_locked', 'password'
        ]
        read_only_fields = ['id', 'employee_id', 'personal_info_locked']

    def update(self, instance, validated_data):
        request = self.context.get('request')
        # If user is not admin, discard administrative fields
        if request and request.user.role != 'Admin':
            allowed_fields = {'phone', 'gender', 'address', 'profile_picture_url', 'password'}
            for key in list(validated_data.keys()):
                if key not in allowed_fields:
                    validated_data.pop(key)
        
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
            
        return super().update(instance, validated_data)

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    employee_code = serializers.ReadOnlyField(source='employee.employee_id')

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_code', 
            'date', 'check_in', 'check_out', 'status'
        ]
        read_only_fields = ['id', 'employee']

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    employee_code = serializers.ReadOnlyField(source='employee.employee_id')

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_code',
            'leave_type', 'start_date', 'end_date', 'reason', 
            'status', 'admin_comments'
        ]
        read_only_fields = ['id', 'employee']

    def update(self, instance, validated_data):
        request = self.context.get('request')
        # Only admin can modify status and admin_comments
        if request and request.user.role != 'Admin':
            validated_data.pop('status', None)
            validated_data.pop('admin_comments', None)
        return super().update(instance, validated_data)
