/* ===== Global Variables ===== */
let selectedClass = '';
let selectedSection = '';
let selectedSubject = '';
let selectedChapter = '';
let selectedVideoPath = '';

/* ===== Subject Chapters Data ===== */
const subjectChapters = {
    'Mathematics': [
        { 
            title: 'Chapter 1: Real Numbers', 
            description: 'Introduction to real numbers and their properties', 
            video: 'english-tenses.mp4' 
        },
        { 
            title: 'Chapter 2: Polynomials', 
            description: 'Understanding polynomials and their operations', 
            video: 'hindi-nibandh-lekhan.mp4' 
        },
        { 
            title: 'Chapter 3: Linear Equations', 
            description: 'Solving linear equations in two variables', 
            video: 'science-life-processes.mp4' 
        },
        { 
            title: 'Chapter 4: Quadratic Equations', 
            description: 'Methods to solve quadratic equations', 
            video: 'math-quadratic-equations.mp4' 
        }
    ],
    'Science': [
        { 
            title: 'Chapter 1: Light and Reflection', 
            description: 'Properties of light and reflection phenomena', 
            video: 'english-tenses.mp4' 
        },
        { 
            title: 'Chapter 2: Acids and Bases', 
            description: 'Chemical properties of acids and bases', 
            video: 'hindi-nibandh-lekhan.mp4' 
        },
        { 
            title: 'Chapter 3: Life Processes', 
            description: 'Basic life processes in living organisms', 
            video: 'science-life-processes.mp4' 
        },
        { 
            title: 'Chapter 4: Natural Resources', 
            description: 'math-quadratic-equations.mp4', 
            video: 'math-quadratic-equations.mp4' 
        }
    ],
    'English': [
        { 
            title: 'Chapter 1: Letter to God', 
            description: 'A story about faith and hope', 
            video: 'hindi-nibandh-lekhan.mp4' 
        },
        { 
            title: 'Chapter 2: Nelson Mandela', 
            description: 'Biography of Nelson Mandela', 
            video: 'math-quadratic-equations.mp4' 
        },
        { 
            title: 'Chapter 3: Grammar - Tenses', 
            description: 'Understanding different types of tenses', 
            video: 'english-tenses.mp4' 
        },
        { 
            title: 'Chapter 4: Writing Skills', 
            description: 'Improving writing and composition skills', 
            video: 'science-life-processes.mp4' 
        }
    ],
    'Hindi': [
        { 
            title: 'Chapter 1: हिंदी वर्णमाला', 
            description: 'हिंदी वर्णमाला और उसके नियम', 
            video: 'english-tenses.mp4' 
        },
        { 
            title: 'Chapter 2: व्याकरण - काल', 
            description: 'हिंदी व्याकरण में काल के प्रकार', 
            video: 'math-quadratic-equations.mp4' 
        },
        { 
            title: 'Chapter 3: कहानी - दो बैलों की कथा', 
            description: 'प्रेमचंद की प्रसिद्ध कहानी', 
            video: 'science-life-processes.mp4' 
        },
        { 
            title: 'Chapter 4: निबंध लेखन', 
            description: 'हिंदी निबंध लेखन की तकनीक', 
            video: 'hindi-nibandh-lekhan.mp4' 
        }
    ]
};

/* ===== Navigation Functions ===== */
function redirectToLogin(userType) {
    if (userType === 'teacher') {
        const teacherId = prompt('Enter Teacher ID (format: class8):');
        const password = prompt('Enter Password (format: sectionb):');
        
        console.log('Teacher ID entered:', teacherId);
        console.log('Password entered:', password);
        
        if (teacherId && password) {
            const classMatch = teacherId.toLowerCase().match(/class(\d+)/);
            const sectionMatch = password.toLowerCase().match(/section([abc])/);
            
            console.log('Class match:', classMatch);
            console.log('Section match:', sectionMatch);
            
            if (classMatch && sectionMatch) {
                const classNum = classMatch[1];
                const section = sectionMatch[1].toUpperCase();
                
                console.log('Extracted class:', classNum);
                console.log('Extracted section:', section);
                
                if (['6', '7', '8', '9', '10'].includes(classNum)) {
                    sessionStorage.setItem('userType', 'teacher');
                    sessionStorage.setItem('userId', teacherId);
                    sessionStorage.setItem('selectedClass', classNum);
                    sessionStorage.setItem('selectedSection', section);
                    
                    alert(`Login successful! Going to Class ${classNum}, Section ${section}`);
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    alert('Invalid class number.');
                }
            } else {
                alert('Format error. Use exactly: class8 and sectionb');
            }
        }
    } else if (userType === 'student') {
        const studentId = prompt('Enter Student ID:');
        const password = prompt('Enter Password:');
        
        if (studentId && password && studentId === password) {
            sessionStorage.setItem('userType', 'student');
            sessionStorage.setItem('userId', studentId);
            window.location.href = 'student-dashboard.html';
        } else {
            alert('Invalid credentials. Student ID and Password must match for demo.');
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('userId');
        window.location.href = 'index.html';
    }
}

/* ===== Student Dashboard Functions ===== */
function selectClass(classNum) {
    const validClasses = ['6', '7', '8', '9', '10'];
    const cls = String(classNum);
    
    if (!validClasses.includes(cls)) {
        alert('Invalid class selected. Please choose between 6 and 10.');
        return;
    }

    selectedClass = cls;
    
    // Update headers
    updateSectionHeader();
    updateSubjectHeader();
    
    // Show section selection
    hideElement('classSelection');
    showElement('sectionSelection');
}

function selectSection(section) {
    selectedSection = section;
    
    // Update subject header
    updateSubjectHeader();
    
    // Show subject selection
    hideElement('sectionSelection');
    showElement('subjectSelection');
}

function selectSubject(subject) {
    selectedSubject = subject;
    
    // Update chapter header
    updateChapterHeader();
    
    // Show chapter selection
    hideElement('subjectSelection');
    showElement('chapterSelection');
    
    // Load chapters for the selected subject
    loadChapters(subject);
}

function selectChapter(chapterTitle, chapterDescription, videoPath) {
    selectedChapter = chapterTitle;
    selectedVideoPath = videoPath;
    
    // Hide chapter selection and show video player
    hideElement('chapterSelection');
    showElement('videoPlayer');
    
    // Set video title
    const videoTitleEl = document.getElementById('videoTitle');
    if (videoTitleEl) {
        videoTitleEl.textContent = chapterTitle;
    }
    
    // Load video
    loadVideo(videoPath);
    
    // Show feedback section
    showElement('feedbackSection');
}

function loadChapters(subject) {
    const chapterList = document.getElementById('chapterList');
    if (!chapterList) return;

    const chapters = subjectChapters[subject] || [];
    chapterList.innerHTML = '';

    if (chapters.length === 0) {
        chapterList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No chapters available for this subject.</p>';
        return;
    }

    chapters.forEach((chapter) => {
        const chapterDiv = document.createElement('div');
        chapterDiv.className = 'chapter-item';
        chapterDiv.onclick = () => selectChapter(chapter.title, chapter.description, chapter.video);
        chapterDiv.innerHTML = `
            <h4>${chapter.title}</h4>
            <p>${chapter.description}</p>
        `;
        chapterList.appendChild(chapterDiv);
    });
}

function loadVideo(videoPath) {
    const videoEl = document.getElementById('videoFrame');
    if (videoEl) {
        videoEl.src = videoPath;
        videoEl.load();
    }
    
    // Set up download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadVideo();
    }
}

function downloadVideo() {
    if (!selectedVideoPath) {
        alert('No video selected for download.');
        return;
    }
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = selectedVideoPath;
    link.download = `${selectedChapter.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download activity
    trackStudentActivity('video_download', {
        class: selectedClass,
        section: selectedSection,
        subject: selectedSubject,
        chapter: selectedChapter,
        videoPath: selectedVideoPath
    });
}

/* ===== Navigation Back Functions ===== */
function goBackToClass() {
    hideElement('sectionSelection');
    showElement('classSelection');
    selectedClass = '';
    resetHeaders();
}

function goBackToSection() {
    hideElement('subjectSelection');
    showElement('sectionSelection');
    selectedSection = '';
    updateSubjectHeader();
}

function goBackToSubject() {
    hideElement('chapterSelection');
    showElement('subjectSelection');
    selectedSubject = '';
}

function goBackToChapter() {
    hideElement('videoPlayer');
    hideElement('feedbackSection');
    showElement('chapterSelection');
    
    selectedChapter = '';
    selectedVideoPath = '';
    
    // Stop video playback
    const videoEl = document.getElementById('videoFrame');
    if (videoEl) {
        videoEl.src = '';
        videoEl.load();
    }
}

/* ===== Header Update Functions ===== */
function updateSectionHeader() {
    const secHeader = document.querySelector('#sectionSelection .step-header h2');
    if (secHeader) {
        secHeader.textContent = `Select Section (Class ${selectedClass})`;
    }
}

function updateSubjectHeader() {
    const subjHeader = document.querySelector('#subjectSelection .step-header h2');
    if (subjHeader) {
        if (selectedSection) {
            subjHeader.textContent = `Select Subject (Class ${selectedClass} - Section ${selectedSection})`;
        } else {
            subjHeader.textContent = `Select Subject (Class ${selectedClass})`;
        }
    }
}

function updateChapterHeader() {
    const chapterHeader = document.querySelector('#chapterSelection .step-header h2');
    if (chapterHeader) {
        chapterHeader.textContent = `Select Chapter (${selectedSubject}) - Class ${selectedClass}`;
    }
}

function resetHeaders() {
    const secHeader = document.querySelector('#sectionSelection .step-header h2');
    const subjHeader = document.querySelector('#subjectSelection .step-header h2');
    const chapterHeader = document.querySelector('#chapterSelection .step-header h2');
    
    if (secHeader) secHeader.textContent = 'Select Section';
    if (subjHeader) subjHeader.textContent = 'Select Subject';
    if (chapterHeader) chapterHeader.textContent = 'Select Chapter';
}

/* ===== Utility Functions ===== */
function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function trackStudentActivity(activity, data) {
    const userId = sessionStorage.getItem('userId') || 'anonymous';
    const timestamp = new Date().toISOString();
    
    console.log(`Student Activity: ${activity}`, {
        userId,
        timestamp,
        ...data
    });
    
    // In a real application, this would send data to a server
    // For now, we'll store it locally or just log it
    try {
        const activities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
        activities.push({
            userId,
            activity,
            timestamp,
            ...data
        });
        localStorage.setItem('studentActivities', JSON.stringify(activities.slice(-50))); // Keep only last 50 activities
    } catch (error) {
        console.error('Error storing student activity:', error);
    }
}

/* ===== Dashboard Initialization ===== */
function initializeDashboard() {
    const userType = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId');
    
    // Initialize student dashboard
    const studentNameElement = document.getElementById('studentName');
    if (studentNameElement && userType === 'student' && userId) {
        studentNameElement.textContent = `Welcome, ${userId}`;
    } else if (studentNameElement && !userId) {
        studentNameElement.textContent = 'Welcome, Student';
    }
    
    // Initialize teacher dashboard
    const teacherNameElement = document.getElementById('teacherName');
    if (teacherNameElement && userType === 'teacher' && userId) {
        teacherNameElement.textContent = `Welcome, ${userId}`;
        loadFeedbackData();
        
        // Auto-navigate if teacher has pre-selected class and section
        const storedClass = sessionStorage.getItem('selectedClass');
        const storedSection = sessionStorage.getItem('selectedSection');
        
        if (storedClass && storedSection) {
            // Set global variables
            selectedClass = storedClass;
            selectedSection = storedSection;
            
            // Hide class and section selection, show subject selection
            hideElement('classSelection');
            hideElement('sectionSelection');
            showElement('subjectSelection');
            
            // Update the subject header
            updateSubjectHeader();
        }
    }
}

function createFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.className = 'feedback-card';
    
    const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
    
    card.innerHTML = `
        <div class="feedback-header">
            <span class="student-id">Student ID: ${feedback.studentId}</span>
            <span class="feedback-date">${new Date(feedback.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="feedback-content">
            <p><strong>Subject:</strong> ${feedback.subject}</p>
            <p><strong>Chapter:</strong> ${feedback.chapter}</p>
            <p><strong>Rating:</strong> ${stars}</p>
            <p><strong>Comment:</strong> ${feedback.comment}</p>
        </div>
    `;
    
    return card;
}

/* ===== Feedback Simulation (Replace with real Google Forms integration) ===== */
function simulateStudentFeedback() {
    // This function simulates student feedback submission
    // In a real application, this would be handled by Google Forms
    
    const sampleFeedbacks = [
        {
            studentId: sessionStorage.getItem('userId') || 'STU001',
            subject: selectedSubject || 'Mathematics',
            chapter: selectedChapter || 'Sample Chapter',
            rating: Math.floor(Math.random() * 5) + 1,
            comment: 'This is a sample feedback comment. Great explanation!',
            timestamp: new Date().toISOString()
        }
    ];
    
    try {
        const existingFeedback = JSON.parse(localStorage.getItem('studentFeedback') || '[]');
        const updatedFeedback = [...existingFeedback, ...sampleFeedbacks];
        localStorage.setItem('studentFeedback', JSON.stringify(updatedFeedback.slice(-20))); // Keep last 20 feedback
        
        alert('Thank you for your feedback! Your response has been submitted.');
    } catch (error) {
        console.error('Error storing feedback:', error);
    }
}

/* ===== Form Validation ===== */
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#e1e5e9';
        }
    });
    
    return isValid;
}

/* ===== Error Handling ===== */
function handleVideoError() {
    const videoEl = document.getElementById('videoFrame');
    if (videoEl) {
        videoEl.innerHTML = `
            <div style="
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 400px; 
                background: #f8f9fa; 
                color: #666; 
                text-align: center;
                padding: 40px;
            ">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 20px; color: #ccc;">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <h3 style="margin-bottom: 15px;">Video Not Available</h3>
                <p>The video file could not be loaded. Please ensure the video file exists in the assets/videos/ folder.</p>
                <p style="margin-top: 10px; font-size: 0.9rem; color: #999;">Expected path: ${selectedVideoPath}</p>
            </div>
        `;
    }
}

/* ===== Event Listeners ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Add video error handling
    const videoEl = document.getElementById('videoFrame');
    if (videoEl) {
        videoEl.addEventListener('error', handleVideoError);
        videoEl.addEventListener('loadstart', function() {
            console.log('Loading video:', videoEl.src);
        });
    }
    
    // Add feedback form simulation (remove when real Google Form is integrated)
    const feedbackSection = document.getElementById('feedbackSection');
    if (feedbackSection) {
        // Add a temporary feedback button for demo
        const tempButton = document.createElement('button');
        tempButton.textContent = 'Submit Sample Feedback (Demo)';
        tempButton.className = 'download-btn';
        tempButton.style.marginTop = '20px';
        tempButton.onclick = simulateStudentFeedback;
        
        const feedbackNote = feedbackSection.querySelector('.feedback-note');
        if (feedbackNote) {
            feedbackNote.appendChild(tempButton);
        }
    }
    
    // Check if user is authorized
    const userType = sessionStorage.getItem('userType');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage.includes('dashboard') && !userType) {
        alert('Please login first to access the dashboard.');
        window.location.href = 'index.html';
    }
    
    // Auto-refresh feedback for teachers every 30 seconds
    if (userType === 'teacher' && currentPage.includes('teacher-dashboard')) {
        setInterval(loadFeedbackData, 30000);
    }
});

/* ===== Utility Functions for File Management ===== */
function checkVideoFileExists(videoPath) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.oncanplay = () => resolve(true);
        video.onerror = () => resolve(false);
        video.src = videoPath;
    });
}

/* ===== Data Export Functions (for teachers) ===== */
function exportStudentData() {
    try {
        const activities = JSON.parse(localStorage.getItem('studentActivities') || '[]');
        const feedback = JSON.parse(localStorage.getItem('studentFeedback') || '[]');
        
        const exportData = {
            activities,
            feedback,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `lms-data-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
    }
}

/* ===== Search and Filter Functions ===== */
function filterFeedback(criteria) {
    // This function can be used to filter feedback by subject, rating, etc.
    console.log('Filtering feedback by:', criteria);
}

/* ===== Accessibility Functions ===== */
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
}

function increaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    document.body.style.fontSize = (currentSize + 2) + 'px';
}

function decreaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
    if (currentSize > 12) {
        document.body.style.fontSize = (currentSize - 2) + 'px';
    }
}

/* ===== Performance Optimization ===== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced search function
const debouncedSearch = debounce(function(query) {
    console.log('Searching for:', query);
    // Implement search functionality here
}, 300);

/* ===== Local Storage Management ===== */
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('studentActivities');
        localStorage.removeItem('studentFeedback');
        sessionStorage.clear();
        alert('All data has been cleared.');
        window.location.href = 'index.html';
    }
}

/* ===== Console Information for Developers ===== */
console.log(`
🎓 Nabha Vidya Learning Management System
📚 Version: 1.0.0
🚀 Ready for SIH25019

📁 Expected folder structure:
   /project-root
      /assets
         /logo.png
         /videos/
            math-real-numbers.mp4
            math-polynomials.mp4
            ... (add your video files here)
      /css
         styles.css
      /js
         script.js
      index.html
      teacher-dashboard.html
      student-dashboard.html

⚠️  To integrate with Google Forms:
   1. Create your Google Form
   2. Get the embed URL
   3. Replace the iframe src in student-dashboard.html
   4. Set up form responses to be accessible via API

🔧 For production deployment:
   - Replace demo login with real authentication
   - Implement proper video file validation
   - Add server-side feedback storage
   - Enable offline caching with Service Worker
`);



/* ================================
   TEACHER VIDEO SELECTION
================================ */
function teacherSelectSubject(subject) {
    selectedSubject = subject;
    updateChapterHeader();
    hideElement('teacherSubjectSelection');
    showElement('teacherChapterSelection');
    loadChapters(subject, 'teacherChapterList', true);
}

function teacherSelectChapter(chapterTitle, chapterDescription, videoPath) {
    selectedChapter = chapterTitle;
    selectedVideoPath = videoPath;

    hideElement('teacherChapterSelection');
    showElement('teacherVideoPlayer');

    const videoTitleEl = document.getElementById('teacherVideoTitle');
    if (videoTitleEl) videoTitleEl.textContent = chapterTitle;

    loadVideo(videoPath, 'teacherVideoFrame', 'teacherDownloadBtn');
}

/* ================================
   FEEDBACK & TEACHER DASHBOARD
================================ */
function loadFeedbackData() {
    const feedbackContainer = document.getElementById('feedbackContainer');
    const noFeedback = document.getElementById('noFeedback');
    
    if (!feedbackContainer) return;
    
    try {
        const storedFeedback = JSON.parse(localStorage.getItem('studentFeedback') || '[]');
        if (storedFeedback.length === 0) {
            feedbackContainer.style.display = 'none';
            if (noFeedback) noFeedback.style.display = 'block';
            return;
        }
        
        feedbackContainer.innerHTML = '';
        storedFeedback.forEach(feedback => {
            const feedbackCard = createFeedbackCard(feedback);
            feedbackContainer.appendChild(feedbackCard);
        });
        
        feedbackContainer.style.display = 'grid';
        if (noFeedback) noFeedback.style.display = 'none';
    } catch (error) {
        console.error('Error loading feedback data:', error);
        if (noFeedback) noFeedback.style.display = 'block';
    }
}

function createFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.className = 'feedback-card';
    const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
    card.innerHTML = `
        <div class="feedback-header">
            <span class="student-id">Student ID: ${feedback.studentId}</span>
            <span class="feedback-date">${new Date(feedback.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="feedback-content">
            <p><strong>Subject:</strong> ${feedback.subject}</p>
            <p><strong>Chapter:</strong> ${feedback.chapter}</p>
            <p><strong>Rating:</strong> ${stars}</p>
            <p><strong>Comment:</strong> ${feedback.comment}</p>
        </div>
    `;
    return card;
}

/* ================================
   INIT + EVENTS
================================ */
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    const userType = sessionStorage.getItem('userType');
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage.includes('dashboard') && !userType) {
        alert('Please login first to access the dashboard.');
        window.location.href = 'index.html';
    }
    if (userType === 'teacher' && currentPage.includes('teacher-dashboard')) {
        setInterval(loadFeedbackData, 30000);
    }
});

/* ================================
   INIT DASHBOARD
================================ */
function initializeDashboard() {
    const userType = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId');
    
    const studentNameElement = document.getElementById('studentName');
    if (studentNameElement && userType === 'student' && userId) {
        studentNameElement.textContent = `Welcome, ${userId}`;
    }
    
    const teacherNameElement = document.getElementById('teacherName');
    if (teacherNameElement && userType === 'teacher' && userId) {
        teacherNameElement.textContent = `Welcome, ${userId}`;
        loadFeedbackData();
    }
}


const ASSETS = [
  "./",
  "index.html",
  "student-dashboard.html",
  "teacher-dashboard.html",
  "styles.css",
  "script.js",
  "manifest.json",
  "logo-removebg-preview.png",
  // icons
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  // etc.
];


// Auto-navigation for teachers - add this at the end of script.js
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    initializeDashboard();
    
    // Additional check for teacher auto-navigation
    setTimeout(function() {
        const userType = sessionStorage.getItem('userType');
        const storedClass = sessionStorage.getItem('selectedClass');
        const storedSection = sessionStorage.getItem('selectedSection');
        
        if (userType === 'teacher' && storedClass && storedSection) {
            // Set global variables
            window.selectedClass = storedClass;
            window.selectedSection = storedSection;
            
            // Force navigation to subject selection
            const classSelection = document.getElementById('classSelection');
            const sectionSelection = document.getElementById('sectionSelection');
            const subjectSelection = document.getElementById('subjectSelection');
            
            if (classSelection) classSelection.classList.add('hidden');
            if (sectionSelection) sectionSelection.classList.add('hidden');
            if (subjectSelection) subjectSelection.classList.remove('hidden');
            
            // Update header
            const subjHeader = document.querySelector('#subjectSelection .step-header h2');
            if (subjHeader) {
                subjHeader.textContent = `Select Subject (Class ${storedClass} - Section ${storedSection})`;
            }
        }
    }, 500);
});

/* ===== End of Script ===== */
