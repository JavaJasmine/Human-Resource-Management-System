import datetime
import random
from django.core.management.base import BaseCommand
from api.models import CustomUser, Attendance, LeaveRequest

class Command(BaseCommand):
    help = 'Seeds the HRMS database with mock employee, attendance, and leave request data.'

    def handle(self, *args, **options):
        self.stdout.write("Deleting old database records...")
        Attendance.objects.all().delete()
        LeaveRequest.objects.all().delete()
        CustomUser.objects.all().delete()

        self.stdout.write("Creating users...")
        
        # 1. Admin
        admin = CustomUser.objects.create_user(
            email='admin@hrms.com',
            password='AdminPassword123',
            employee_id='EMP-001',
            role='Admin',
            full_name='Sophia Vance',
            phone='555-0100',
            address='100 Executive Boulevard, Suite 500, Metropia',
            job_title='HR Director',
            salary_base=8500.00,
            salary_allowances=1500.00,
            salary_deductions=500.00,
            profile_picture_url='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        )
        
        # 2. Employee 1
        emp1 = CustomUser.objects.create_user(
            email='alice@hrms.com',
            password='UserPassword123',
            employee_id='EMP-002',
            role='Employee',
            full_name='Alice Cooper',
            phone='555-0192',
            address='123 Dev Lane, Tech City, TC 94016',
            job_title='Senior Software Engineer',
            salary_base=6500.00,
            salary_allowances=800.00,
            salary_deductions=300.00,
            profile_picture_url='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        )

        # 3. Employee 2
        emp2 = CustomUser.objects.create_user(
            email='bob@hrms.com',
            password='UserPassword123',
            employee_id='EMP-003',
            role='Employee',
            full_name='Bob Miller',
            phone='555-0183',
            address='456 Art Way, Design District, DD 90021',
            job_title='UX/UI Designer',
            salary_base=5800.00,
            salary_allowances=700.00,
            salary_deductions=250.00,
            profile_picture_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        )

        # 4. Employee 3
        emp3 = CustomUser.objects.create_user(
            email='charlie@hrms.com',
            password='UserPassword123',
            employee_id='EMP-004',
            role='Employee',
            full_name='Charlie Davis',
            phone='555-0174',
            address='789 Test Road, Quality Town, QT 30301',
            job_title='QA Engineer',
            salary_base=4800.00,
            salary_allowances=600.00,
            salary_deductions=200.00,
            profile_picture_url='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        )

        employees = [emp1, emp2, emp3]
        self.stdout.write(f"Seeded 1 Admin and {len(employees)} Employees.")

        # Seed attendance logs for the past 14 weekdays (excluding weekends)
        self.stdout.write("Seeding attendance records for the past 14 days...")
        today = datetime.date.today()
        seeded_count = 0

        # We will loop through the last 18 calendar days to find 14 weekdays
        calendar_days = []
        day_offset = 1
        while len(calendar_days) < 14:
            d = today - datetime.timedelta(days=day_offset)
            if d.weekday() < 5:  # Monday to Friday
                calendar_days.append(d)
            day_offset += 1

        for emp in employees:
            # Let's pick 1 random weekday for this employee to be absent
            absent_day = random.choice(calendar_days)
            # Let's pick 1 random weekday for a half-day
            half_day = random.choice([d for d in calendar_days if d != absent_day])
            # Let's check Bob's leave (we will seed approved leave for Bob for the first 3 weekdays in calendar_days)
            bob_leave_days = calendar_days[0:3] if emp == emp2 else []

            for d in calendar_days:
                if emp == emp2 and d in bob_leave_days:
                    # Bob on approved leave
                    Attendance.objects.create(
                        employee=emp,
                        date=d,
                        check_in=None,
                        check_out=None,
                        status='Leave'
                    )
                elif d == absent_day:
                    # Absent day (no check in/out)
                    Attendance.objects.create(
                        employee=emp,
                        date=d,
                        check_in=None,
                        check_out=None,
                        status='Absent'
                    )
                elif d == half_day:
                    # Half day
                    in_time = datetime.time(9, 0, 0)
                    out_time = datetime.time(12, 30, 0)
                    Attendance.objects.create(
                        employee=emp,
                        date=d,
                        check_in=in_time,
                        check_out=out_time,
                        status='Half-day'
                    )
                else:
                    # Standard Present day (random check-in around 8:45 to 9:15, check-out around 17:00 to 18:00)
                    in_hour = 8
                    in_minute = random.randint(40, 59)
                    if random.choice([True, False]):
                        in_hour = 9
                        in_minute = random.randint(0, 15)

                    out_hour = 17
                    out_minute = random.randint(0, 59)
                    if random.choice([True, False]):
                        out_hour = 18
                        out_minute = random.randint(0, 15)

                    in_time = datetime.time(in_hour, in_minute, 0)
                    out_time = datetime.time(out_hour, out_minute, 0)

                    Attendance.objects.create(
                        employee=emp,
                        date=d,
                        check_in=in_time,
                        check_out=out_time,
                        status='Present'
                    )
                seeded_count += 1

        self.stdout.write(f"Seeded {seeded_count} attendance logs.")

        # Seed Leave Requests
        self.stdout.write("Seeding leave requests...")

        # 1. Alice: Pending Sick Leave (starts 5 days from today, ends 7 days from today)
        LeaveRequest.objects.create(
            employee=emp1,
            leave_type='Sick',
            start_date=today + datetime.timedelta(days=5),
            end_date=today + datetime.timedelta(days=7),
            reason='Dental surgery recovery',
            status='Pending'
        )

        # 2. Bob: Approved Paid Leave (was during the first 3 calendar weekdays)
        # Note: Bob's attendance was already seeded as 'Leave' for these dates
        LeaveRequest.objects.create(
            employee=emp2,
            leave_type='Paid',
            start_date=calendar_days[2],  # start date (earlier)
            end_date=calendar_days[0],    # end date (later in chronological loop order, start < end is handled below)
            reason='Family summer trip to Hawaii',
            status='Approved',
            admin_comments='Enjoy your vacation, Bob! Approved by Soph.'
        )
        # Fix the dates logic: let's set start and end date explicitly to avoid chron order issues
        bob_leave = LeaveRequest.objects.latest('id')
        start = min(calendar_days[0], calendar_days[2])
        end = max(calendar_days[0], calendar_days[2])
        bob_leave.start_date = start
        bob_leave.end_date = end
        bob_leave.save()

        # 3. Charlie: Rejected Unpaid Leave (was for next week, rejected)
        LeaveRequest.objects.create(
            employee=emp3,
            leave_type='Unpaid',
            start_date=today + datetime.timedelta(days=1),
            end_date=today + datetime.timedelta(days=3),
            reason='Attending a video gaming tournament',
            status='Rejected',
            admin_comments='Sorry Charlie, we have major releases scheduled next week and require full QA coverage.'
        )

        self.stdout.write("Database seeding completed successfully!")
