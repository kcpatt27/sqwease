// SRS (Spaced Repetition System) utilities using simplified SM-2 algorithm
// Based on Anki's scheduling with 4 rating buttons: Again, Hard, Good, Easy

const SRS = (function() {
    'use strict';

    // Default intervals (in minutes) for new cards in learning phase
    const LEARNING_STEPS = [1, 10]; // <1m, <10m from Anki screenshot
    
    // Default intervals for review phase (in days)
    const GRADUATING_INTERVAL = 1; // First review: 1 day
    const EASY_INTERVAL = 4; // Easy button on new card: 4 days
    
    // Ease factor adjustments
    const EASE_MIN = 1.3;
    const EASE_DEFAULT = 2.5;
    const EASE_AGAIN_PENALTY = -0.2;
    const EASE_HARD_PENALTY = -0.15;
    const EASE_EASY_BONUS = 0.15;
    
    // Interval modifiers for review phase
    const HARD_INTERVAL_MULTIPLIER = 1.2;
    
    function now() {
        return new Date().toISOString();
    }
    
    function addMinutes(date, minutes) {
        return new Date(new Date(date).getTime() + minutes * 60000);
    }
    
    function addDays(date, days) {
        return new Date(new Date(date).getTime() + days * 86400000);
    }
    
    // Initialize a new card
    function initCard(itemId) {
        return {
            id: itemId,
            state: 'new',        // 'new' | 'learning' | 'review'
            due: now(),
            interval: 0,         // days (for review) or step index (for learning)
            easeFactor: EASE_DEFAULT,
            reps: 0,
            lapses: 0,
            lastReview: null
        };
    }
    
    // Calculate next review date and update card based on rating
    // rating: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
    function reviewCard(card, rating) {
        const updated = Object.assign({}, card);
        updated.lastReview = now();
        updated.reps += 1;
        
        if (card.state === 'new') {
            // First time seeing this card
            if (rating === 1) { // Again
                updated.state = 'learning';
                updated.interval = 0;
                updated.due = addMinutes(new Date(), LEARNING_STEPS[0]).toISOString();
            } else if (rating === 2) { // Hard
                updated.state = 'learning';
                updated.interval = 0;
                updated.due = addMinutes(new Date(), LEARNING_STEPS[0]).toISOString();
            } else if (rating === 3) { // Good
                updated.state = 'review';
                updated.interval = GRADUATING_INTERVAL;
                updated.due = addDays(new Date(), GRADUATING_INTERVAL).toISOString();
            } else { // Easy
                updated.state = 'review';
                updated.interval = EASY_INTERVAL;
                updated.due = addDays(new Date(), EASY_INTERVAL).toISOString();
                updated.easeFactor += EASE_EASY_BONUS;
            }
        } else if (card.state === 'learning') {
            // Card in learning phase
            if (rating === 1) { // Again
                updated.interval = 0;
                updated.lapses += 1;
                updated.due = addMinutes(new Date(), LEARNING_STEPS[0]).toISOString();
            } else if (rating === 2) { // Hard
                // Stay at current step or advance to next if at last step
                const nextStep = Math.min(updated.interval + 1, LEARNING_STEPS.length - 1);
                updated.interval = nextStep;
                updated.due = addMinutes(new Date(), LEARNING_STEPS[nextStep]).toISOString();
            } else if (rating === 3 || rating === 4) { // Good or Easy
                // Graduate to review
                updated.state = 'review';
                updated.interval = rating === 4 ? EASY_INTERVAL : GRADUATING_INTERVAL;
                updated.due = addDays(new Date(), updated.interval).toISOString();
                if (rating === 4) updated.easeFactor += EASE_EASY_BONUS;
            }
        } else { // review
            // Card in review phase
            if (rating === 1) { // Again - back to learning
                updated.state = 'learning';
                updated.interval = 0;
                updated.lapses += 1;
                updated.easeFactor = Math.max(EASE_MIN, updated.easeFactor + EASE_AGAIN_PENALTY);
                updated.due = addMinutes(new Date(), LEARNING_STEPS[0]).toISOString();
            } else if (rating === 2) { // Hard
                updated.interval = Math.max(1, Math.round(card.interval * HARD_INTERVAL_MULTIPLIER));
                updated.easeFactor = Math.max(EASE_MIN, updated.easeFactor + EASE_HARD_PENALTY);
                updated.due = addDays(new Date(), updated.interval).toISOString();
            } else if (rating === 3) { // Good
                updated.interval = Math.round(card.interval * card.easeFactor);
                updated.due = addDays(new Date(), updated.interval).toISOString();
            } else { // Easy
                updated.interval = Math.round(card.interval * card.easeFactor * 1.3);
                updated.easeFactor = updated.easeFactor + EASE_EASY_BONUS;
                updated.due = addDays(new Date(), updated.interval).toISOString();
            }
        }
        
        return updated;
    }
    
    // Check if card is due for review
    function isDue(card) {
        return new Date(card.due) <= new Date();
    }
    
    // Get interval display string for rating buttons
    function getIntervalDisplay(card, rating) {
        if (card.state === 'new') {
            if (rating === 1 || rating === 2) return '<1m';
            if (rating === 3) return '1d';
            return '4d';
        } else if (card.state === 'learning') {
            if (rating === 1) return '<1m';
            if (rating === 2) {
                const nextStep = Math.min(card.interval + 1, LEARNING_STEPS.length - 1);
                return '<' + LEARNING_STEPS[nextStep] + 'm';
            }
            if (rating === 3) return '1d';
            return '4d';
        } else {
            if (rating === 1) return '<1m';
            if (rating === 2) {
                const days = Math.max(1, Math.round(card.interval * HARD_INTERVAL_MULTIPLIER));
                return days + 'd';
            }
            if (rating === 3) {
                const days = Math.round(card.interval * card.easeFactor);
                return days + 'd';
            }
            const days = Math.round(card.interval * card.easeFactor * 1.3);
            return days + 'd';
        }
    }
    
    return {
        initCard: initCard,
        reviewCard: reviewCard,
        isDue: isDue,
        getIntervalDisplay: getIntervalDisplay
    };
})();
