document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 0;
    let answers = {};
    
    const pages = [
        'welcome-page',
        'mobile-page', 
        'forms-page',
        'navigation-page',
        'accessibility-page',
        'results-page'
    ];

    const questionGroups = {
        'mobile-page': ['q1', 'q2', 'q3', 'q4'],
        'forms-page': ['q5', 'q6', 'q7', 'q8'],
        'navigation-page': ['q9', 'q10', 'q11', 'q12'],
        'accessibility-page': ['q13', 'q14', 'q15', 'q16']
    };

    // Initialize
    updateProgress();
    setupEventListeners();

    function setupEventListeners() {
        // Listen for radio button changes
        document.addEventListener('change', function(e) {
            if (e.target.type === 'radio') {
                handleAnswerChange(e.target);
            }
        });

        // Email form
        const emailForm = document.getElementById('email-form');
        if (emailForm) {
            emailForm.addEventListener('submit', handleEmailSubmit);
        }
    }

    function handleAnswerChange(radio) {
        answers[radio.name] = parseInt(radio.value);
        saveAnswers();
        checkPageCompletion();
    }

    function checkPageCompletion() {
        const currentPageId = pages[currentPage];
        const questions = questionGroups[currentPageId];
        
        if (questions) {
            const answered = questions.every(q => answers[q] !== undefined);
            const nextButton = document.getElementById(currentPageId.replace('-page', '-next'));
            if (nextButton) {
                nextButton.disabled = !answered;
            }
        }
    }

    function saveAnswers() {
        localStorage.setItem('ux-health-answers', JSON.stringify(answers));
    }

    function loadAnswers() {
        const saved = localStorage.getItem('ux-health-answers');
        if (saved) {
            answers = JSON.parse(saved);
            // Restore radio button states
            Object.entries(answers).forEach(([question, value]) => {
                const radio = document.querySelector(`input[name="${question}"][value="${value}"]`);
                if (radio) radio.checked = true;
            });
            checkPageCompletion();
        }
    }

    window.nextPage = function() {
        if (currentPage < pages.length - 1) {
            // Hide current page
            document.getElementById(pages[currentPage]).classList.remove('active');
            
            currentPage++;
            
            // Show next page
            document.getElementById(pages[currentPage]).classList.add('active');
            
            // If we're at results page, calculate results
            if (pages[currentPage] === 'results-page') {
                calculateResults();
            }
            
            updateProgress();
            scrollToTop();
        }
    };

    window.prevPage = function() {
        if (currentPage > 0) {
            // Hide current page
            document.getElementById(pages[currentPage]).classList.remove('active');
            
            currentPage--;
            
            // Show previous page
            document.getElementById(pages[currentPage]).classList.add('active');
            
            updateProgress();
            scrollToTop();
        }
    };

    window.restartAssessment = function() {
        currentPage = 0;
        answers = {};
        localStorage.removeItem('ux-health-answers');
        
        // Clear all radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Show welcome page
        pages.forEach(pageId => {
            document.getElementById(pageId).classList.remove('active');
        });
        document.getElementById(pages[0]).classList.add('active');
        
        updateProgress();
        scrollToTop();
    };

    function updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            const progress = (currentPage / (pages.length - 1)) * 100;
            progressFill.style.width = progress + '%';
            progressText.textContent = `Step ${currentPage + 1} of ${pages.length}`;
        }
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function calculateResults() {
        const scores = {
            mobile: getScoreForQuestions(['q1', 'q2', 'q3', 'q4']),
            forms: getScoreForQuestions(['q5', 'q6', 'q7', 'q8']),
            navigation: getScoreForQuestions(['q9', 'q10', 'q11', 'q12']),
            accessibility: getScoreForQuestions(['q13', 'q14', 'q15', 'q16'])
        };

        const totalScore = scores.mobile + scores.forms + scores.navigation + scores.accessibility;
        
        displayResults(totalScore, scores);
        
        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'assessment_complete', {
                'event_category': 'ux_health_check',
                'event_label': 'score_' + totalScore
            });
        }
    }

    function getScoreForQuestions(questionIds) {
        return questionIds.reduce((sum, qId) => {
            return sum + (answers[qId] || 0);
        }, 0);
    }

    function displayResults(totalScore, categoryScores) {
        // Display total score
        document.getElementById('total-score').textContent = totalScore;
        
        // Score interpretation
        const interpretation = getScoreInterpretation(totalScore);
        document.getElementById('interpretation').innerHTML = interpretation;
        
        // Category breakdown
        const breakdown = getCategoryBreakdown(categoryScores);
        document.getElementById('breakdown').innerHTML = breakdown;
        
        // Action steps
        const actions = getActionSteps(categoryScores, totalScore);
        document.getElementById('actions').innerHTML = actions;
    }

    function getScoreInterpretation(score) {
        if (score >= 40) {
            return `
                <h3 class="success">🎉 Healthy UX (${score}/48)</h3>
                <p>Your UX is in good shape! Focus on fine-tuning and monitoring performance metrics. Consider conducting user testing to identify subtle improvements and maintain your competitive edge.</p>
            `;
        } else if (score >= 30) {
            return `
                <h3 class="warning">⚠️ Moderate Issues (${score}/48)</h3>
                <p>You have some problems that are likely costing you conversions. Address your lowest-scoring areas first—these improvements typically show results within 2-4 weeks and can boost conversion rates by 10-25%.</p>
            `;
        } else if (score >= 20) {
            return `
                <h3 style="color: var(--warning-color);">🚨 Significant Problems (${score}/48)</h3>
                <p>UX issues are probably costing you substantial revenue. Prioritize the quick wins below—most can be implemented within a week and show immediate impact on user satisfaction and business metrics.</p>
            `;
        } else {
            return `
                <h3 class="danger">🆘 UX Emergency (${score}/48)</h3>
                <p>Your UX problems are likely costing you 30-50% of potential conversions. Start with mobile experience immediately—this alone could improve conversions by 15-25% within the first month.</p>
            `;
        }
    }

    function getCategoryBreakdown(categoryScores) {
        const categories = [
            { name: '📱 Mobile Experience', score: categoryScores.mobile, key: 'mobile' },
            { name: '📋 Forms & Conversion', score: categoryScores.forms, key: 'forms' },
            { name: '🧭 Navigation & Findability', score: categoryScores.navigation, key: 'navigation' },
            { name: '♿ Accessibility & Clarity', score: categoryScores.accessibility, key: 'accessibility' }
        ];

        // Sort by score (lowest first)
        categories.sort((a, b) => a.score - b.score);

        let html = '<h3>Your Priority Areas (Ranked by Need):</h3>';
        categories.forEach((cat, index) => {
            const percentage = Math.round((cat.score / 12) * 100);
            const priorities = [
                '🔥 Immediate attention needed',
                '⚡ Address within 30 days', 
                '📈 Tackle after first two improve',
                '✅ Maintain current performance'
            ];
            
            html += `
                <div class="category-score">
                    <div>
                        <strong>${cat.name}</strong><br>
                        <small style="color: var(--text-secondary);">${priorities[index]}</small>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.25rem; font-weight: 700;">${cat.score}/12</span><br>
                        <small style="color: var(--text-secondary);">${percentage}%</small>
                    </div>
                </div>
            `;
        });

        return html;
    }

    function getActionSteps(categoryScores, totalScore) {
        // Find lowest scoring category
        const categories = {
            mobile: categoryScores.mobile,
            forms: categoryScores.forms,
            navigation: categoryScores.navigation,
            accessibility: categoryScores.accessibility
        };

        const lowest = Object.keys(categories).reduce((a, b) => 
            categories[a] < categories[b] ? a : b
        );

        const actionPlans = {
            mobile: {
                title: 'Mobile Experience',
                actions: [
                    'Run a mobile speed test using Google PageSpeed Insights',
                    'Increase button sizes to minimum 44px touch targets',
                    'Test your checkout flow on an actual phone',
                    'Implement responsive images and optimize for mobile-first loading'
                ]
            },
            forms: {
                title: 'Forms & Conversion',
                actions: [
                    'Remove every non-essential form field immediately',
                    'Add guest checkout option prominently',
                    'Display all costs upfront before checkout begins',
                    'Add inline validation with helpful error messages'
                ]
            },
            navigation: {
                title: 'Navigation & Findability',
                actions: [
                    'Add clear breadcrumbs to all pages',
                    'Test if new visitors can find your main offering in under 10 seconds',
                    'Implement or improve your site search functionality',
                    'Add progress indicators to multi-step processes'
                ]
            },
            accessibility: {
                title: 'Accessibility & Clarity',
                actions: [
                    'Increase text size and contrast immediately',
                    'Add descriptive alt text to all images',
                    'Test navigation using only keyboard (no mouse)',
                    'Ensure all buttons and links have clear, descriptive labels'
                ]
            }
        };

        let html = `<h3>🎯 Start Here: ${actionPlans[lowest].title}</h3>
                   <p><strong>Focus on your lowest-scoring area first for maximum impact:</strong></p>
                   <ul>`;
        
        actionPlans[lowest].actions.forEach(action => {
            html += `<li>${action}</li>`;
        });
        
        html += '</ul>';
        
        if (totalScore < 30) {
            html += `
                <div style="background: #fef3c7; padding: 20px; border-radius: var(--radius-md); margin-top: 24px; border-left: 4px solid var(--warning-color);">
                    <strong>💡 Quick Win Strategy:</strong> Pick your #1 priority area and implement one fix this week. 
                    Most of these changes take under 2 hours but can improve conversion rates by 10-30%.
                </div>
            `;
        }

        return html;
    }

    function handleEmailSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Track email signup
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_signup', {
                'event_category': 'ux_health_check',
                'event_label': email
            });
        }
        
        // Show success message
        e.target.innerHTML = `
            <div style="text-align: center;">
                <h4 style="margin-bottom: 8px;">✅ Thanks! Check your email in a few minutes.</h4>
                <p style="margin: 0; opacity: 0.9; font-size: 0.875rem;">The complete UX Recovery Guide is on its way.</p>
            </div>
        `;
    }

    // Load saved answers on page load
    loadAnswers();
});
