from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)
    email = models.EmailField(unique=True)
    employee_id = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=[('Admin', 'Admin'), ('Employee', 'Employee')], default='Employee')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(
        max_length=20,
        choices=[('Male','Male'),('Female','Female'),('Other','Other'),('Prefer not to say','Prefer not to say')],
        blank=True, default=''
    )
    address = models.TextField(blank=True, null=True)
    job_title = models.CharField(max_length=100, default='Employee')
    salary_base = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    salary_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    salary_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    profile_picture_url = models.TextField(blank=True, default='')
    documents = models.JSONField(default=dict, blank=True)
    personal_info_locked = models.BooleanField(
        default=False,
        help_text='Set to True once employee has personally filled phone, address and profile picture. Admin cannot override these fields once locked.'
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['employee_id', 'full_name']

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Half-day', 'Half-day'),
        ('Leave', 'Leave')
    ]
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Absent')

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} - {self.status}"

class LeaveRequest(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('Paid', 'Paid'),
        ('Sick', 'Sick'),
        ('Unpaid', 'Unpaid')
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled')
    ]
    employee = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    admin_comments = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.start_date} to {self.end_date} - {self.status}"
