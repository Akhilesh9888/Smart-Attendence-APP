document.addEventListener('DOMContentLoaded', () => {
        // --- Elements ---
        const loginScreen = document.getElementById('loginScreen');
        const adminLoginScreen = document.getElementById('adminLoginScreen');
        const app = document.getElementById('app');
        const loginStudentBtn = document.getElementById('loginStudent');
        const loginFacultyBtn = document.getElementById('loginFaculty');
        const loginAdminBtn = document.getElementById('loginAdmin');
        const adminRoleBtns = document.querySelectorAll('.admin-role-btn');
        const backToLoginBtn = document.getElementById('backToLogin');
        const logoutBtn = document.getElementById('logoutBtn');
        const navMenu = document.getElementById('nav-menu');
        const userName = document.getElementById('userName');
        
        const allViews = document.querySelectorAll('#app main > div');
        const modals = {
            attendance: document.getElementById('attendanceModal'),
            event: document.getElementById('eventModal'),
            qrCode: document.getElementById('qrCodeModal')
        };

        // --- State ---
        let currentUserRole = null;
        let attendanceChartInstance = null;

        // --- Functions ---
        const setupUIForRole = (role) => {
            currentUserRole = role;
            loginScreen.classList.add('hidden');
            adminLoginScreen.classList.add('hidden');
            app.classList.add('flex');
            app.classList.remove('hidden');
            
            navMenu.innerHTML = '';
            let defaultViewId;

            if (role === 'student') {
                userName.textContent = 'Welcome, Alex!';
                const navs = [
                    { id: 'studentDashboardBtn', text: 'Dashboard', view: 'studentDashboardView' },
                    { id: 'attendanceBtn', text: 'Attendance', view: 'attendanceView' },
                    { id: 'plannerBtn', text: 'Planner', view: 'plannerView' }
                ];
                defaultViewId = 'studentDashboardView';
                createNavButtons(navs);
                document.getElementById('markAttendanceBtn').classList.remove('hidden');

            } else if (role === 'faculty') {
                userName.textContent = 'Welcome, Dr. Smith!';
                const navs = [
                    { id: 'facultyDashboardBtn', text: 'Dashboard', view: 'facultyDashboardView' },
                    { id: 'attendanceBtn', text: 'Records', view: 'attendanceView' }
                ];
                defaultViewId = 'facultyDashboardView';
                createNavButtons(navs);
                document.getElementById('markAttendanceBtn').classList.add('hidden');
            } else if (role.startsWith('admin')) {
                let adminTitle = 'Admin';
                if (role === 'admin_college') adminTitle = 'College Administrator';
                if (role === 'admin_career') adminTitle = 'Career Counselor';
                if (role === 'admin_education') adminTitle = 'Education Dept.';

                userName.textContent = `Welcome, ${adminTitle}!`;
                 const navs = [
                    { id: 'adminDashboardBtn', text: 'Dashboard', view: 'adminDashboardView' },
                ];
                defaultViewId = 'adminDashboardView';
                createNavButtons(navs);
                createAdminDashboard();
                filterAdminTools(role);
            }
            if (defaultViewId) {
                switchView(defaultViewId);
            }
        };
        
        const filterAdminTools = (role) => {
            const allTools = {
                manageUsersBtn: document.getElementById('manageUsersBtn'),
                manageCoursesBtn: document.getElementById('manageCoursesBtn'),
                careerCounselingBtn: document.getElementById('careerCounselingBtn'),
                generateReportsBtn: document.getElementById('generateReportsBtn'),
                systemSettingsBtn: document.getElementById('systemSettingsBtn')
            };

            // Hide all tools initially
            Object.values(allTools).forEach(tool => {
                if(tool) tool.style.display = 'none';
            });

            // Show tools based on role
            if (role === 'admin_college') {
                allTools.manageUsersBtn.style.display = 'flex';
                allTools.manageCoursesBtn.style.display = 'flex';
                allTools.systemSettingsBtn.style.display = 'flex';
                allTools.generateReportsBtn.style.display = 'flex';
            } else if (role === 'admin_career') {
                allTools.careerCounselingBtn.style.display = 'flex';
            } else if (role === 'admin_education') {
                allTools.generateReportsBtn.style.display = 'flex';
            }
        };

        const createAdminDashboard = () => {
            const ctx = document.getElementById('attendanceChart').getContext('2d');
            if (attendanceChartInstance) {
                attendanceChartInstance.destroy();
            }
            attendanceChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Computer Science', 'Mechanical', 'Electronics', 'Civil', 'Biotechnology'],
                    datasets: [{
                        label: 'Average Attendance %',
                        data: [94, 88, 91, 85, 95],
                        backgroundColor: 'rgba(102, 126, 234, 0.6)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 1,
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } },
                    plugins: { legend: { display: false } }
                }
            });
        };

        const createNavButtons = (navs) => {
            navs.forEach((nav, index) => {
                const button = document.createElement('button');
                button.id = nav.id;
                button.textContent = nav.text;
                button.className = 'nav-btn text-white font-semibold transition';
                button.dataset.view = nav.view;
                if (index === 0) {
                    button.classList.add('opacity-100', 'border-b-2', 'border-white', 'pb-1');
                } else {
                    button.classList.add('opacity-75', 'hover:opacity-100');
                }
                button.addEventListener('click', () => switchView(nav.view));
                navMenu.appendChild(button);
            });
        };

        const switchView = (viewId) => {
            allViews.forEach(v => v.classList.add('hidden'));
            document.getElementById(viewId)?.classList.remove('hidden');

            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('opacity-100', btn.dataset.view === viewId);
                btn.classList.toggle('border-b-2', btn.dataset.view === viewId);
                btn.classList.toggle('border-white', btn.dataset.view === viewId);
                btn.classList.toggle('pb-1', btn.dataset.view === viewId);
                btn.classList.toggle('opacity-75', btn.dataset.view !== viewId);
            });
        };

        const logout = () => {
            currentUserRole = null;
            app.classList.remove('flex');
            app.classList.add('hidden');
            loginScreen.classList.remove('hidden');
        };

        const generateCalendar = () => {
            const calendarEl = document.getElementById('calendar');
            calendarEl.innerHTML = '';
            const today = new Date();
            const month = today.getMonth();
            const year = today.getFullYear();

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Add empty cells for days before the 1st of the month
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                calendarEl.appendChild(emptyCell);
            }

            // Add days of the month
            for (let i = 1; i <= daysInMonth; i++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'p-2 h-24 border rounded-lg flex flex-col';
                dayCell.textContent = i;

                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayCell.classList.add('bg-blue-100', 'font-bold');
                }

                // Dummy events
                if (i === 15) {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'text-xs bg-green-200 text-green-800 p-1 rounded mt-1 truncate';
                    eventEl.textContent = 'Mid-term exam';
                    dayCell.appendChild(eventEl);
                }
                if (i === 22) {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'text-xs bg-purple-200 text-purple-800 p-1 rounded mt-1 truncate';
                    eventEl.textContent = 'Project Deadline';
                    dayCell.appendChild(eventEl);
                }

                calendarEl.appendChild(dayCell);
            }
        };

        // --- Event Listeners ---
        loginStudentBtn.addEventListener('click', () => setupUIForRole('student'));
        loginFacultyBtn.addEventListener('click', () => setupUIForRole('faculty'));
        loginAdminBtn.addEventListener('click', () => {
            loginScreen.classList.add('hidden');
            adminLoginScreen.classList.remove('hidden');
            adminLoginScreen.classList.add('flex');
        });
        
        adminRoleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const role = btn.dataset.adminRole;
                setupUIForRole(role);
            });
        });

        backToLoginBtn.addEventListener('click', () => {
            adminLoginScreen.classList.add('hidden');
            adminLoginScreen.classList.remove('flex');
            loginScreen.classList.remove('hidden');
        });

        logoutBtn.addEventListener('click', logout);

        // Modal triggers
        document.getElementById('markAttendanceBtn').addEventListener('click', () => modals.attendance.classList.add('show'));
        document.getElementById('addEventBtn').addEventListener('click', () => modals.event.classList.add('show'));

        // Modal closers
        document.getElementById('closeAttendanceModal').addEventListener('click', () => modals.attendance.classList.remove('show'));
        document.getElementById('closeEventModal').addEventListener('click', () => modals.event.classList.remove('show'));
        document.getElementById('saveEventBtn').addEventListener('click', (e) => {
            e.preventDefault();
            modals.event.classList.remove('show');
        });

        // QR Code Generator Logic
        let qrcodeInstance = null;
        document.getElementById('generateQRBtn').addEventListener('click', () => {
            const classSelect = document.getElementById('classSelect');
            const selectedClass = classSelect.options[classSelect.selectedIndex].text;
            const qrCodeContainer = document.getElementById('qrcode');
            const qrClassInfo = document.getElementById('qrClassInfo');

            qrCodeContainer.innerHTML = ''; // Clear previous QR code
            qrClassInfo.textContent = selectedClass;

            const qrData = {
                class: selectedClass,
                timestamp: new Date().toISOString(),
                validUntil: new Date(Date.now() + 60000).toISOString() // Valid for 60 seconds
            };

            qrcodeInstance = new QRCode(qrCodeContainer, {
                text: JSON.stringify(qrData),
                width: 256,
                height: 256,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            modals.qrCode.classList.add('show');
        });

        document.getElementById('closeQRModal').addEventListener('click', () => {
            modals.qrCode.classList.remove('show');
        });

        // Attendance Modal Tabs
        const tabBtns = modals.attendance.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                modals.attendance.querySelectorAll('[id^="tab-content-"]').forEach(content => content.classList.add('hidden'));
                document.getElementById(`tab-content-${btn.dataset.tab}`).classList.remove('hidden');

                const statusText = document.getElementById('attendanceStatus');
                if (btn.dataset.tab === 'qr') {
                    statusText.innerHTML = 'Scan QR for <span class="font-bold">AI & ML</span>.';
                } else if (btn.dataset.tab === 'proximity') {
                    statusText.innerHTML = 'Searching for class via Bluetooth/WiFi...';
                } else if (btn.dataset.tab === 'face') {
                    statusText.innerHTML = 'Position your face in the camera frame.';
                }
            });
        });


        generateCalendar(); // Initial call
    });