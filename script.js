document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('assessment-form');
    const submitBtn = document.getElementById('calculate-btn');
    const results = document.getElementById('results');
    const emailForm = document.getElementById('email-form');
    
    let scores = {
        mobile: 0,
        forms: 0,
        navigation: 0,
        accessibility: 0
    };

    // Update category scores in real-time
    function updateScores() {
        // Mobile (questions 1-4)
        scores.mobile = getScoreForQuestions([1, 2, 3, 4]);
        document.getElementById('mobile-score').textContent = `${scores.mobile}/12`;
        
        // Forms (questions 5-8)
        scores.forms = getScoreForQuestions([5, 6, 7, 8]);
        document.getElementById('forms-score').textContent = `${scores.forms}/12`;
        
        // Navigation (questions 9-12)
        scores.navigation = getScoreForQuestions([9, 10, 11, 12]);
        document.getElementById('nav-score').textContent = `${scores.navigation}/12`;
        
        // Accessibility (questions 13-16)
        scores.accessibility = getScoreForQuestions([13, 14, 15, 16]);
        document.getElementById('a11y-score').textContent = `${scores.accessibility}/12`;
        
        // Enable submit button if all questions answered
        const totalQuestions = 16;
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
        submitBtn.disabled = answeredQuestions < totalQuestions;
    }

    function getScoreForQuestions(questionNumbers) {
        let score = 0;
        questionNumbers.forEach(num => {
            const checked = document.querySelector(`input[name="q${num}"]:checked`);
            if (checked) {
                score += parseInt(checked.value);
            }
        });
        return score;
    }

    // Listen for radio button changes
    form.addEventListener('change', updateScores);

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const totalScore = scores.mobile + scores.forms + scores.navigation + scores.accessibility;
        
        // Show results
        displayResults(totalScore, scores);
        
        // Scroll to results
        results.scrollIntoView({ behavior: 'smooth' });
    });

    function displayResults(totalScore, categoryScores) {
        results.classList.remove('hidden');
        
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
                <h3 style="color: #28a745;">🎉 Healthy UX (${score}/48)</h3>
                <p>Your UX is in good shape! Focus on fine-tuning and monitoring performance metrics. Consider conducting user testing to identify subtle improvements.</p>
            `;
        } else if (score >= 30) {
            return `
                <h3 style="color: #ffc107;">⚠️ Moderate Issues (${score}/48)</h3>
                <p>You have some problems that are likely costing you conversions. Address your lowest-scoring areas first—these improvements typically show results within 2-4 weeks.</p>
            `;
        } else if (score >= 20) {
            return `
                <h3 style="color: #fd7e14;">🚨 Significant Problems (${score}/48)</h3>
                <p>UX issues are probably costing you substantial revenue. Prioritize the quick wins below—most can be implemented within a week and show immediate impact.</p>
            `;
        } else {
            return `
                <h3 style="color: #dc3545;">🆘 UX Emergency (${score}/48)</h3>
                <p>Your UX problems are likely costing you 30-50% of potential conversions. Start with mobile experience immediately—this alone could improve conversions by 15-25%.</p>
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

        let html = '<h3>Your Priority Areas:</h3>';
        categories.forEach((cat, index) => {
            const percentage = Math.round((cat.score / 12) * 100);
            const priority = index === 0 ? 'Immediate attention needed' : 
                           index === 1 ? 'Address within 30 days' : 
                           index === 2 ? 'Tackle after first two improve' : 
                           'Maintain current performance';
            
            html += `
                <div class="category-score">
                    <div>
                        <strong>${cat.name}</strong><br>
                        <small style="color: #666;">${priority}</small>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.2rem; font-weight: bold;">${cat.score}/12</span><br>
                        <small>${percentage}%</small>
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
            mobile: [
                'Run a mobile speed test using Google PageSpeed Insights',
                'Increase button sizes to minimum 44px touch targets',
                'Test your checkout flow on an actual phone',
                'Implement responsive images and optimize for mobile-first loading'
            ],
            forms: [
                'Remove every non-essential form field immediately',
                'Add guest checkout option prominently',
                'Display all costs upfront before checkout begins',
                'Add inline validation with helpful error messages'
            ],
            navigation: [
                'Add clear breadcrumbs to all pages',
                'Test if new visitors can find your main offering in under 10 seconds',
                'Implement or improve your site search functionality',
                'Add progress indicators to multi-step processes'
            ],
            accessibility: [
                'Increase text size and contrast immediately',
                'Add descriptive alt text to all images',
                'Test navigation using only keyboard (no mouse)',
                'Ensure all buttons and links have clear, descriptive labels'
            ]
        };

        let html = `<h3>Immediate Action Steps:</h3>
                   <p><strong>Start with ${lowest.charAt(0).toUpperCase() + lowest.slice(1)} (your lowest-scoring area):</strong></p>
                   <ul>`;
        
        actionPlans[lowest].forEach(action => {
            html += `<li>${action}</li>`;
        });
        
        html += '</ul>';
        
        if (totalScore < 30) {
            html += `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                    <strong>💡 Next Step:</strong> Pick your #1 priority area and implement one fix this week. 
                    Most of these changes take under 2 hours but can improve conversion rates by 10-30%.
                </div>
            `;
        }

        return html;
    }

    // Handle email form
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        // Here you would typically send to an email service
        // For now, we'll just show a success message
        this.innerHTML = `
            <div style="text-align: center;">
                <h4>✅ Thanks! Check your email in a few minutes.</h4>
                <p style="margin-top: 10px; opacity: 0.9;">The complete UX Recovery Guide is on its way.</p>
            </div>
        `;
        
        // Optional: Track in Google Analytics or other analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_signup', {
                'event_category': 'ux_health_check',
                'event_label': email
            });
        }
    });
});
