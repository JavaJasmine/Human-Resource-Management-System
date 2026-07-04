from django.urls import path
from api.views import (
    SignupView, SigninView, SignoutView, CurrentUserProfileView,
    EmployeeListView, EmployeeProfileDetailView, AttendanceListView,
    AttendanceClockToggleView, LeaveRequestListView, LeaveRequestApplyView,
    LeaveRequestApproveView, LeaveRequestCancelView, PayrollListView, PayrollUpdateView,
    ProfilePictureUploadView, EmployeeCreateView
)

urlpatterns = [
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/signin/', SigninView.as_view(), name='signin'),
    path('auth/signout/', SignoutView.as_view(), name='signout'),
    path('profile/', CurrentUserProfileView.as_view(), name='profile-current'),
    path('profile/upload/', ProfilePictureUploadView.as_view(), name='profile-upload'),
    path('profile/<int:pk>/', EmployeeProfileDetailView.as_view(), name='profile-detail'),
    path('employees/', EmployeeListView.as_view(), name='employees-list'),
    path('employees/create/', EmployeeCreateView.as_view(), name='employees-create'),
    path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
    path('attendance/clock/', AttendanceClockToggleView.as_view(), name='attendance-clock'),
    path('leave/', LeaveRequestListView.as_view(), name='leave-list'),
    path('leave/apply/', LeaveRequestApplyView.as_view(), name='leave-apply'),
    path('leave/<int:pk>/approve/', LeaveRequestApproveView.as_view(), name='leave-approve'),
    path('leave/<int:pk>/cancel/', LeaveRequestCancelView.as_view(), name='leave-cancel'),
    path('payroll/', PayrollListView.as_view(), name='payroll-list'),
    path('payroll/<int:pk>/', PayrollUpdateView.as_view(), name='payroll-update'),
]
