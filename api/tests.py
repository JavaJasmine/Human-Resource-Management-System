from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from api.models import CustomUser, LeaveRequest, Attendance

class HRMSTests(APITestCase):
    def setUp(self):
        # Create an Admin
        self.admin = CustomUser.objects.create_user(
            email='admin@test.com',
            password='AdminPassword123',
            employee_id='T-EMP-001',
            role='Admin',
            full_name='Sophia Admin'
        )
        # Create an Employee
        self.employee = CustomUser.objects.create_user(
            email='employee@test.com',
            password='EmployeePassword123',
            employee_id='T-EMP-002',
            role='Employee',
            full_name='Alice Employee'
        )

    def test_signup_requires_preregistration(self):
        """Unknown user without pre-registration must be rejected."""
        url = reverse('signup')
        data = {
            'email': 'unknown@test.com',
            'password': 'NewPassword123',
            'employee_id': 'T-EMP-999',
            'full_name': 'Unknown User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_admin_preregister_then_employee_signup(self):
        """HR admin pre-registers an employee, then employee sets password via signup."""
        # Step 1: Admin signs in
        signin_url = reverse('signin')
        signin_res = self.client.post(signin_url, {'email': 'admin@test.com', 'password': 'AdminPassword123'}, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + signin_res.data['token'])

        # Step 2: Admin creates the employee record (no password)
        create_url = reverse('employees-create')
        create_res = self.client.post(create_url, {
            'email': 'new@test.com',
            'employee_id': 'T-EMP-003',
            'full_name': 'New Employee',
            'role': 'Employee'
        }, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

        # Step 3: Employee activates account via signup
        self.client.credentials()  # Clear admin token
        signup_url = reverse('signup')
        signup_res = self.client.post(signup_url, {
            'email': 'new@test.com',
            'password': 'NewPassword123',
            'employee_id': 'T-EMP-003',
            'full_name': 'New Employee'
        }, format='json')
        self.assertEqual(signup_res.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', signup_res.data)
        self.assertEqual(signup_res.data['user']['email'], 'new@test.com')

    def test_signin(self):
        url = reverse('signin')
        data = {
            'email': 'employee@test.com',
            'password': 'EmployeePassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_unauthenticated_profile_access(self):
        url = reverse('profile-current')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_view_directory(self):
        # Sign in as employee
        signin_url = reverse('signin')
        signin_res = self.client.post(signin_url, {'email': 'employee@test.com', 'password': 'EmployeePassword123'}, format='json')
        token = signin_res.data['token']
        
        # Set credentials header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        # Try to view employee list
        url = reverse('employees-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_view_directory(self):
        # Sign in as admin
        signin_url = reverse('signin')
        signin_res = self.client.post(signin_url, {'email': 'admin@test.com', 'password': 'AdminPassword123'}, format='json')
        token = signin_res.data['token']
        
        # Set credentials header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        # Try to view employee list
        url = reverse('employees-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 2)

    def test_cancel_leave_request(self):
        signin_url = reverse('signin')
        signin_res = self.client.post(signin_url, {'email': 'employee@test.com', 'password': 'EmployeePassword123'}, format='json')
        token = signin_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type='Sick',
            start_date='2026-07-10',
            end_date='2026-07-12',
            reason='Medical checkup'
        )

        cancel_url = reverse('leave-cancel', kwargs={'pk': leave.pk})
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        leave.refresh_from_db()
        self.assertEqual(leave.status, 'Cancelled')

    def test_profile_picture_upload(self):
        signin_url = reverse('signin')
        signin_res = self.client.post(signin_url, {'email': 'employee@test.com', 'password': 'EmployeePassword123'}, format='json')
        token = signin_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        import io
        file_buffer = io.BytesIO(b"fake image content")
        file_buffer.name = "avatar.png"

        upload_url = reverse('profile-upload')
        response = self.client.post(upload_url, {'file': file_buffer}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', response.data)
        self.assertTrue(response.data['url'].startswith('/media/profile_pics/'))

