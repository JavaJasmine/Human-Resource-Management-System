from django.contrib import admin
from api.models import CustomUser, Attendance, LeaveRequest

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'email', 'full_name', 'role', 'job_title')
    search_fields = ('employee_id', 'email', 'full_name')
    list_filter = ('role', 'job_title')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'check_in', 'check_out', 'status')
    list_filter = ('status', 'date')
    search_fields = ('employee__full_name', 'employee__employee_id')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__full_name', 'employee__employee_id')
