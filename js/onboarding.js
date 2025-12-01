// Onboarding Wizard Logic
const OnboardingWizard = {
    currentStep: 1,
    totalSteps: 5,
    data: {},
    experiences: [],

    init: () => {
        OnboardingWizard.setupEventListeners();
        OnboardingWizard.updateProgress();
        OnboardingWizard.addExperienceEntry(); // Add first experience by default
    },

    setupEventListeners: () => {
        document.getElementById('next-btn').addEventListener('click', OnboardingWizard.nextStep);
        document.getElementById('prev-btn').addEventListener('click', OnboardingWizard.prevStep);
        document.getElementById('finish-btn').addEventListener('click', OnboardingWizard.finish);
        document.getElementById('add-experience').addEventListener('click', OnboardingWizard.addExperienceEntry);
    },

    nextStep: () => {
        if (!OnboardingWizard.validateCurrentStep()) {
            return;
        }

        OnboardingWizard.collectCurrentStepData();

        if (OnboardingWizard.currentStep < OnboardingWizard.totalSteps) {
            OnboardingWizard.currentStep++;
            OnboardingWizard.showStep(OnboardingWizard.currentStep);
            OnboardingWizard.updateProgress();
        }
    },

    prevStep: () => {
        if (OnboardingWizard.currentStep > 1) {
            OnboardingWizard.currentStep--;
            OnboardingWizard.showStep(OnboardingWizard.currentStep);
            OnboardingWizard.updateProgress();
        }
    },

    showStep: (step) => {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(el => {
            el.classList.remove('active');
        });

        // Show current step
        document.getElementById(`step-${step}`).classList.add('active');

        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 === step) {
                indicator.classList.add('active');
            } else if (index + 1 < step) {
                indicator.classList.add('completed');
            }
        });

        // Update buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');

        prevBtn.classList.toggle('hidden', step === 1);
        nextBtn.classList.toggle('hidden', step === OnboardingWizard.totalSteps);
        finishBtn.classList.toggle('hidden', step !== OnboardingWizard.totalSteps);

        // Populate review if on last step
        if (step === OnboardingWizard.totalSteps) {
            OnboardingWizard.populateReview();
        }
    },

    updateProgress: () => {
        const progress = (OnboardingWizard.currentStep / OnboardingWizard.totalSteps) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
    },

    validateCurrentStep: () => {
        const step = OnboardingWizard.currentStep;
        let isValid = true;

        if (step === 1) {
            const required = ['name', 'title', 'email', 'phone'];
            required.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    input.classList.add('border-red-500');
                    isValid = false;
                } else {
                    input.classList.remove('border-red-500');
                }
            });
        } else if (step === 2) {
            const summaryEn = document.getElementById('summary-en');
            if (!summaryEn.value.trim()) {
                summaryEn.classList.add('border-red-500');
                isValid = false;
            } else {
                summaryEn.classList.remove('border-red-500');
            }
        }

        if (!isValid) {
            alert('Please fill in all required fields (marked with *)');
        }

        return isValid;
    },

    collectCurrentStepData: () => {
        const step = OnboardingWizard.currentStep;

        if (step === 1) {
            OnboardingWizard.data.personalInfo = {
                name: document.getElementById('name').value,
                title: document.getElementById('title').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                website: document.getElementById('website').value || 'yourwebsite.com',
                profileImage: document.getElementById('profileImage').value || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
            };
        } else if (step === 2) {
            OnboardingWizard.data.aboutDescription = {
                en: document.getElementById('summary-en').value,
                es: document.getElementById('summary-es').value || document.getElementById('summary-en').value,
                fr: document.getElementById('summary-fr').value || document.getElementById('summary-en').value
            };
        } else if (step === 3) {
            OnboardingWizard.collectExperiences();
        } else if (step === 4) {
            OnboardingWizard.collectSkills();
        }
    },

    addExperienceEntry: () => {
        const container = document.getElementById('experience-container');
        const index = container.children.length;

        const expDiv = document.createElement('div');
        expDiv.className = 'p-4 bg-gray-800 rounded border border-gray-700';
        expDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-cyan-400">Experience #${index + 1}</h3>
                ${index > 0 ? `<button class="text-red-500 hover:text-red-400" onclick="this.parentElement.parentElement.remove()">Remove</button>` : ''}
            </div>
            <div class="space-y-3">
                <input type="text" placeholder="Job Title *" class="exp-title w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none" required>
                <input type="text" placeholder="Company *" class="exp-company w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none" required>
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Location" class="exp-location w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none">
                    <input type="text" placeholder="Period (e.g., 2020-2023)" class="exp-period w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none">
                </div>
                <textarea placeholder="Description (one achievement per line)" rows="3" class="exp-description w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"></textarea>
            </div>
        `;
        container.appendChild(expDiv);
    },

    collectExperiences: () => {
        const experiences = [];
        const expDivs = document.querySelectorAll('#experience-container > div');

        expDivs.forEach((div, index) => {
            const title = div.querySelector('.exp-title').value;
            const company = div.querySelector('.exp-company').value;
            const location = div.querySelector('.exp-location').value || 'Remote';
            const period = div.querySelector('.exp-period').value || 'Present';
            const description = div.querySelector('.exp-description').value;

            if (title && company) {
                experiences.push({
                    id: String(index + 1),
                    title,
                    company,
                    location,
                    period,
                    period_es: period,
                    period_fr: period,
                    description: {
                        en: description.split('\n').filter(l => l.trim()),
                        es: description.split('\n').filter(l => l.trim()),
                        fr: description.split('\n').filter(l => l.trim())
                    }
                });
            }
        });

        OnboardingWizard.data.experiences = experiences;
    },

    collectSkills: () => {
        const skillsLang = document.getElementById('skills-languages').value;
        const skillsTools = document.getElementById('skills-tools').value;
        const spokenLang = document.getElementById('spoken-languages').value;

        OnboardingWizard.data.skills = {
            languages: skillsLang ? skillsLang.split(',').map(s => s.trim()) : [],
            android: [],
            tools: skillsTools ? skillsTools.split(',').map(s => s.trim()) : [],
            methodologies: ['Agile', 'Scrum']
        };

        OnboardingWizard.data.education = [{
            id: '1',
            year: new Date().getFullYear().toString(),
            title: 'Professional Experience',
            institution: 'Self-taught',
            type: 'experience'
        }];

        // Parse spoken languages
        const languages = [];
        if (spokenLang) {
            spokenLang.split(',').forEach((lang, index) => {
                const parts = lang.trim().split('-');
                if (parts.length === 2) {
                    languages.push({
                        id: String(index + 1),
                        name: parts[0].trim().toUpperCase(),
                        level: parts[1].trim().toUpperCase(),
                        proficiency: parts[1].toLowerCase().includes('native') ? 100 : 80
                    });
                }
            });
        }

        OnboardingWizard.data.languages = languages.length > 0 ? languages : [{
            id: '1',
            name: 'ENGLISH',
            level: 'NATIVE',
            proficiency: 100
        }];
    },

    populateReview: () => {
        const review = document.getElementById('review-content');
        const data = OnboardingWizard.data;

        review.innerHTML = `
            <div class="p-4 bg-gray-800 rounded">
                <h3 class="text-xl font-bold text-cyan-400 mb-3">Personal Information</h3>
                <p><strong>Name:</strong> ${data.personalInfo?.name || 'N/A'}</p>
                <p><strong>Title:</strong> ${data.personalInfo?.title || 'N/A'}</p>
                <p><strong>Email:</strong> ${data.personalInfo?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${data.personalInfo?.phone || 'N/A'}</p>
            </div>
            <div class="p-4 bg-gray-800 rounded">
                <h3 class="text-xl font-bold text-cyan-400 mb-3">Professional Summary</h3>
                <p>${data.aboutDescription?.en || 'N/A'}</p>
            </div>
            <div class="p-4 bg-gray-800 rounded">
                <h3 class="text-xl font-bold text-cyan-400 mb-3">Experience</h3>
                <p>${data.experiences?.length || 0} experience(s) added</p>
            </div>
            <div class="p-4 bg-gray-800 rounded">
                <h3 class="text-xl font-bold text-cyan-400 mb-3">Skills</h3>
                <p>${data.skills?.languages?.length || 0} programming languages, ${data.skills?.tools?.length || 0} tools</p>
            </div>
        `;
    },

    finish: () => {
        OnboardingWizard.collectCurrentStepData();

        // Add metadata
        OnboardingWizard.data.id = crypto.randomUUID();
        OnboardingWizard.data.updated_at = new Date().toISOString();

        // Save to localStorage
        localStorage.setItem('cv_data_v1', JSON.stringify(OnboardingWizard.data));
        localStorage.setItem('onboarding_completed', 'true');

        // Redirect to main CV
        window.location.href = 'index.html';
    }
};

// Initialize wizard when DOM is ready
document.addEventListener('DOMContentLoaded', OnboardingWizard.init);
