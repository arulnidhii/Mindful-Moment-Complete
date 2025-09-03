# Mindful Moment - Internal README

## Overview

**Mindful Moment** is an innovative emotional well-being application that transcends traditional mood tracking by delivering **explainable AI-powered insights** alongside conventional data visualization. Our proprietary algorithms analyze user mood patterns, activities, and correlations to provide actionable, understandable insights that empower users to make informed decisions about their emotional well-being and relationships.

## Application Architecture

### Tech Stack
- **Frontend**: React Native with Expo Router
- **State Management**: Zustand with persistent storage
- **Backend**: Firebase (Firestore, Authentication)
- **Platforms**: iOS, Android, Web
- **Key Libraries**: React Native Reanimated, NativeWind, Expo Notifications

### Project Structure
```
Mindful-moment-private-notification/
├── app/                    # Main app screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Daily mood check-in
│   │   ├── insights.tsx   # AI-powered insights dashboard
│   │   ├── partner.tsx    # Relationship insights
│   │   ├── history.tsx    # Mood history
│   │   └── settings.tsx   # App configuration
│   ├── onboarding.tsx     # User onboarding flow
│   └── connect-partner.tsx # Partner connection
├── components/             # Reusable UI components
├── utils/                  # Core business logic
│   ├── advisor/           # Proprietary AI advisor engine
│   ├── patternEngine.ts   # Mood pattern detection
│   └── partnerService.ts  # Partner insights service
├── store/                  # State management
└── constants/              # App configuration
```

## Application Flow

### 1. User Onboarding
- **Profile Creation**: Personalized user setup with mood preferences
- **Initial Assessment**: Baseline mood evaluation and goal setting
- **Partner Connection**: Optional relationship insights setup

### 2. Daily Mood Check-in (Core Flow)
- **Mood Selection**: 5-tier mood scale (struggling → great)
- **Activity Tagging**: Boosters (energy lifters) and drainers (energy depleters)
- **Journal Integration**: Optional narrative context
- **Smart Guidance**: Contextual advice based on mood and time

### 3. Insights Generation
- **Real-time Analysis**: Proprietary algorithms process mood data continuously as users log entries
- **Pattern Detection**: Temporal, correlation, and rhythm analysis across multiple time periods
- **Explainable Insights**: Human-readable explanations with actionable tips and contextual guidance
- **Multi-period Insights**: Day, week, and month-specific analysis with period-appropriate recommendations
- **Dynamic Content**: Insights adapt based on user engagement, feedback, and data patterns
- **Smart Cooldown**: Prevents insight repetition while maintaining relevance and freshness

**Key Files:**
- `app/(tabs)/insights.tsx` - Main insights dashboard with period selection and sharing
- `utils/advisor/buildAdvisor.ts` - Core insight generation pipeline
- `utils/advisor/engine.ts` - Advisor engine interface and implementation
- `utils/patternEngine.ts` - Pattern detection and insight card generation

### 4. Relationship Dynamics
- **Partner Insights**: Shared emotional patterns and relationship health monitoring
- **Weekly Summaries**: Collaborative well-being insights with aggregated partner data
- **Communication Prompts**: Guided conversations based on mood patterns and relationship dynamics
- **Daily Postcards**: Real-time mood sharing between partners with contextual insights
- **Period Aggregation**: Day, week, and month views for relationship pattern analysis
- **Shared Accountability**: Mutual support through visible emotional patterns and trends

**Key Files:**
- `app/(tabs)/partner.tsx` - Partner insights dashboard with period selection
- `src/lib/partnerService.ts` - Partner data synchronization and postcard management
- `src/state/partnerStore.ts` - Partner state management and connection status
- `components/partner/PostcardItem.tsx` - Individual partner insight display
- `components/partner/UnconnectedPartnerView.tsx` - Partner connection setup interface
- `utils/partnerWeekly.ts` - Weekly relationship insights computation


## Today’s Additions — Agentic Actions (Focus Time, Order Your Booster, Prep for Drainer)

This release makes insights directly actionable for both individuals and partners. We added a lightweight, privacy‑preserving action system that attaches context‑aware buttons to insights and partner postcards.

### What shipped today
- Agentic actions pipeline
  - New Action/ActionType model and AdvisorItem.actions
  - generateActionsFor(...) attaches actions based on template id + payload
  - compose functions propagate actions with optional context: 'self' | 'partner'
- Action UI
  - New ActionButtons with icons (phone, sms, whatsapp, calendar, maps, reminder)
  - InsightCard renders actions; Partner Postcards also render actions
- Focus Time (flagship)
  - For weekly rhythm insights, add a calendar block action
  - Labels are partner‑toned in partner contexts: “Block this time for us”
- Order Your Booster (Maps suggestions)
  - For weekly top booster, add:
    - Calendar: “Schedule time for {booster}” (self) / “Plan {booster} time together” (partner)
    - Maps search: “Find {booster} nearby” (self) / “Find a {booster} spot for you both” (partner)
  - Booster → query mapping (examples): nature→park, exercise→gym, social→coffee shop, reading→library, meditation→meditation center, music→live music
- Prep for Drainer (Calendar buffer)
  - For emerging drainer, add:
    - “Add a short decompress buffer” (self) / “...for both of you” (partner)
    - Quick‑win presets:
      - work_stress → “Add 5‑min decompress buffer”
      - screen_time → “Plan a 3 PM reset”
      - commute → “Add 10‑min post‑commute buffer”
- Partner applicability
  - Partner postcards now infer actions client‑side from postcard type + highlights:
    - mood_booster → booster actions
    - gentle_nudge → drainer support/buffer actions
    - rhythm_note → Focus Time block
  - Labels auto‑switch to partner‑toned copy via context='partner'
- Quality + infra
  - Fixed 11 TS errors; tightened typings (LinearGradient colors, setTimeout, Card style)
  - Android bundle check exported successfully (Expo export with sourcemaps)

### Examples (today’s features in action)
- Self — weekly rhythm
  - Insight: “Your rhythm — Best hours: 10:00–13:00. Best day: Sat.”
  - Actions: [Block this time] → opens calendar template to create a protected focus block
- Self — weekly top booster = nature
  - Insight: “Top booster this week — Nature showed the strongest lift.”
  - Actions: [Schedule time for nature] (calendar template), [Find nature nearby] (Google Maps “park near me”)
- Self — week emerging drainer = screen_time
  - Insight: “New drainer noticed — screen_time cropped up.”
  - Actions: [Add a short decompress buffer] (calendar template), [Plan a 3 PM reset]
- Partner — postcard (mood_booster: nature)
  - Card: “A little sunshine from Alex today: a nature walk helped.”
  - Actions: [Plan nature time together], [Find a nature spot for you both]
- Partner — postcard (gentle_nudge: work_stress)
  - Card: “Heads‑up: work_stress may have been draining for Alex today.”
  - Actions: [Ask about their day] (SMS), [Add 5‑min decompress buffer]
- Partner — postcard (rhythm_note)
  - Card: “Alex feels best in the morning.”
  - Action: [Block this time for us]

### Technical notes (where to look)
- Action model/types: utils/advisor/advisorTypes.ts
- Action generator: utils/advisor/actions.ts
- Compose wiring (context awareness): utils/advisor/compose.ts
- Insight UI: components/InsightCard.tsx, components/ActionButtons.tsx, components/ActionIcon.tsx
- Partner actions surface: components/partner/PostcardItem.tsx
- Settings (local partner phone, used for call/sms): app/(tabs)/settings.tsx, store/userStore.ts

### Verification
- Type check: npx tsc -p tsconfig.json --noEmit → clean
- Android bundle check: npx expo export --platform android --experimental-bundle --dump-sourcemap --output-dir .expo-bundle-check → success (bundle + sourcemap generated)

### Notes
- Reminder deep link scaffolding exists (myapp://set-reminder?…), currently routes to Settings; direct scheduling can be enabled later with a small helper if we choose to ship it.

## Proprietary Algorithms & AI Engine

### Advisor Engine Architecture
Our **AdvisorEngineV1** implements a sophisticated pipeline for generating personalized insights:

```typescript
export interface AdvisorEngine {
  detect: (rows: any[], period: Period) => AdvisorEvent[]
  rerank: (events: AdvisorEvent[]) => AdvisorEvent[]
  pickTips: (ctx: { period: Period, events: AdvisorEvent[] }) => void
  compose: (period: Period, events: AdvisorEvent[]) => AdvisorItem[]
}
```

### Event Detection System
The engine detects four key types of patterns through sophisticated algorithms:

1. **Trend Detection** (`detectTrend`)
   - Mood trajectory analysis over time periods with statistical significance
   - Delta calculations between periods using weighted averages
   - Best performance window identification for optimal scheduling
   - Trend reversal detection and momentum analysis
   - Seasonal pattern recognition across longer timeframes

2. **Correlation Analysis** (`detectCorrelation`)
   - Booster-drainer effectiveness mapping with confidence scoring
   - Emerging pattern identification before they become obvious
   - Activity-mood correlation scoring with temporal context
   - Cross-activity interaction effects and combination analysis
   - Novelty detection for new activities and their impact

3. **Rhythm Recognition** (`detectRhythm`)
   - Optimal time-of-day patterns with statistical confidence intervals
   - Day-of-week performance trends accounting for weekly cycles
   - Circadian rhythm insights and sleep-wake pattern correlation
   - Energy level prediction based on historical rhythm data
   - Disruption detection for irregular patterns

4. **Adherence Monitoring** (`detectAdherence`)
   - Check-in consistency tracking with streak analysis
   - Engagement pattern analysis for habit formation insights
   - Optimal check-in timing recommendations
   - Motivation pattern detection and intervention triggers
   - Recovery pattern analysis after missed check-ins

**Key Files:**
- `utils/advisor/detectors.ts` - Core detection algorithms for all pattern types
- `utils/advisor/periodAgg.ts` - Time period aggregation and statistical calculations
- `utils/advisor/salience.ts` - Salience scoring for event prioritization

### Intelligent Composition System
Our template-based composition engine (`composeItemsAsync`) features sophisticated content generation:

- **Dynamic Content Generation**: Contextual insight creation based on detected events with personalized parameters
- **Cooldown Management**: Prevents insight repetition (72-hour cooldown) while maintaining variety
- **Feedback Integration**: User preference learning for personalized insights with category weighting
- **Multi-period Support**: Day, week, and month-specific insights with period-appropriate templates
- **Template Variants**: Multiple text variations for each insight type to prevent monotony
- **Contextual Personalization**: Insights adapt based on user's current mood, time, and recent patterns
- **Fallback System**: Guaranteed insights for new users and sparse data scenarios
- **A/B Testing Ready**: Template system supports experimentation and optimization

**Key Files:**
- `utils/advisor/compose.ts` - Main composition engine with async support and cooldown management
- `utils/advisor/templates.ts` - Core template definitions for day, week, and month insights
- `utils/advisor/templates_extended.ts` - Extended template set for advanced insights
- `utils/advisor/feedback.ts` - User feedback collection and preference learning system
- `utils/advisor/queue.ts` - Insight queuing and delivery management

### Pattern Recognition Engine
The `patternEngine.ts` implements advanced algorithms for comprehensive pattern analysis:

- **Intra-day Pattern Detection**: Mood fluctuations within single days with time-of-day analysis
- **Cross-day Correlation**: Activity-mood relationships over time with statistical significance testing
- **Streak Analysis**: Consistency pattern recognition with milestone tracking and celebration triggers
- **Seasonal Trends**: Long-term pattern identification across months and seasons
- **Activity Effectiveness Mapping**: Booster-drainer impact analysis with confidence scoring
- **Mood Transition Patterns**: State change analysis and prediction modeling
- **Contextual Pattern Recognition**: Weather, time, and external factor correlation
- **Anomaly Detection**: Unusual patterns that may indicate significant changes or issues

**Key Files:**
- `utils/patternEngine.ts` - Core pattern recognition algorithms and insight generation
- `utils/advisor/periodAgg.ts` - Time period aggregation for pattern analysis
- `utils/advisor/detectors.ts` - Pattern detection algorithms integration
- `components/PatternInsight.tsx` - Pattern insight display component
- `components/InsightCard.tsx` - Reusable insight card component
- `store/moodStore.ts` - Mood data management and pattern source

## Unique Selling Points & Differentiators

### Agentic Co‑pilot (New)
Turn insights into action with one tap—across self and partner contexts. Actions are privacy‑preserving (local state only), low friction (open Maps/Calendar/SMS), and context‑aware (labels adapt to partner).

- Focus Time (flagship)
  - What: Protect your best hours by creating a calendar block from rhythm insights
  - Self label: “Block this time”  • Partner label: “Block this time for us”
  - Example: Week rhythm → “Best hours: 10:00–13:00” → [Block this time]
- Order Your Booster (maps + calendar)
  - What: Remove friction to do what helps—schedule or find a place nearby
  - Self labels: “Schedule time for nature”, “Find nature nearby”
  - Partner labels: “Plan nature time together”, “Find a nature spot for you both”
  - Booster→Maps examples: nature→park near me; exercise→gym near me; social→coffee shop near me; reading→library near me
- Prep for Drainer (calendar buffer)
  - What: Add a short decompression/reset buffer around stressors
  - Self/Partner labels: “Add a short decompress buffer” / “...for both of you”
  - Quick‑win presets: work_stress→“Add 5‑min decompress buffer”; screen_time→“Plan a 3 PM reset”; commute→“Add 10‑min post‑commute buffer”
- Partner applicability
  - Partner postcards now render actions inline (booster, drainer, rhythm)
  - Example: “Heads‑up: work_stress...” → [Ask about their day] + [Add 5‑min decompress buffer]

Why it matters: This closes the loop from “insight” to “execution,” differentiating us from data‑only trackers. It also elevates partner value with supportive, shared actions.

### 1. Explainable AI vs. Traditional Charts
**Traditional Approach (What We Avoid)**: Most mood tracking apps rely solely on data visualization - charts, graphs, and raw statistics that users must interpret themselves.

**Our Approach**: We provide **explainable insights** that translate data into actionable understanding:

```typescript
// Example of our explainable insight generation
{
  title: "Daytime stress nudged up",
  text: "Looks like stress ticked up 15%. It often follows later bedtimes this week.",
  tips: [
    { text: "If it's past 11pm, dim lights and put the phone away for 20 minutes." },
    { text: "Set out tomorrow's clothes before 10:30 pm to ease the morning." }
  ]
}
```

### 2. Balanced Visualization Strategy
We strike the perfect balance between familiarity and innovation:

- **Charts for Familiarity**: Users see traditional mood distributions and trends
- **Explainable Insights for Innovation**: AI-generated narratives that provide new understanding
- **Progressive Disclosure**: Start with simple insights, gradually introduce complexity

### 3. Proprietary Correlation Engine
Our correlation detection goes beyond simple frequency counting:

- **Temporal Correlation**: Identifies when activities are most effective
- **Contextual Analysis**: Considers mood state when evaluating activity impact
- **Emerging Pattern Detection**: Spots new correlations before they become obvious

### 4. Relationship Intelligence
Unique partner insights that go beyond individual tracking:

- **Shared Pattern Recognition**: Identifies relationship dynamics
- **Communication Prompts**: AI-generated conversation starters
- **Collaborative Insights**: Joint well-being optimization

### 5. Adaptive Learning System
Our feedback mechanism continuously improves insight quality:

- **User Preference Learning**: Tracks which insights users find helpful
- **Category Weighting**: Adjusts insight types based on user engagement
- **Cooldown Optimization**: Prevents insight fatigue through intelligent timing

### 6. Intelligent Notification System
Our sophisticated notification engine goes beyond simple reminders:

- **Personalized Messaging**: Dynamic notification content with user name interpolation
- **Smart Timing**: Contextual notifications based on user patterns and missed check-ins
- **Gentle Encouragement**: Non-intrusive nudges that respect user boundaries
- **Streak Celebrations**: Milestone-based notifications that reinforce positive habits
- **Pattern-Based Alerts**: Proactive notifications when users might benefit from booster activities
- **Anti-Spam Logic**: Intelligent cooldown prevents notification fatigue while maintaining engagement

**Key Files:**
- `utils/notifications.ts` - Core notification system with message pools and scheduling
- `utils/notificationManager.ts` - Notification management and user preferences

### 7. Social Sharing & Visual Storytelling
Unique social features that transform insights into shareable content:

- **Instagram-Ready Cards**: Beautiful, gradient-based shareable insight cards
- **Multiple Gradient Themes**: 6 luxury gradient options for personalization
- **Chart Integration**: Share mood distributions and patterns as visual stories
- **Brand Integration**: Seamless app promotion through shared content
- **Cross-Platform Sharing**: Native sharing to social media, messaging apps, and more

**Key Files:**
- `components/ShareableInsightCard.tsx` - Main shareable card component with gradients
- `components/ShareableDailyRhythmCard.tsx` - Daily rhythm sharing component
- `components/ShareablePatternInsightCard.tsx` - Pattern insight sharing component
- `app/(tabs)/insights.tsx` - Sharing functionality integration

### 8. Advanced Haptic Feedback System
Sophisticated tactile feedback that enhances user experience:

- **Contextual Haptics**: Different haptic patterns for different interactions
- **Success Celebrations**: Distinct haptic feedback for achievements and milestones
- **Selection Feedback**: Light haptic confirmation for all user interactions
- **Warning Patterns**: Appropriate haptic feedback for important actions
- **Accessibility Enhancement**: Tactile feedback improves usability for all users

**Key Files:**
- `utils/haptics.ts` - Haptic feedback system with multiple patterns
- `components/MilestonePopup.tsx` - Milestone celebration with haptic feedback
- `store/moodStore.ts` - Haptic integration in mood tracking

### 9. Trial Optimization & Milestone System
Strategic trial experience that maximizes user engagement:

- **14-Day Trial Structure**: Optimal trial length for relationship value discovery
- **Milestone Tracking**: Aha moment, partner preview, and weekly insight milestones
- **Progressive Value Unlocking**: Gradual feature introduction based on usage
- **Conversion Optimization**: Strategic review prompts at key engagement moments
- **Trial Scaffolding**: Guided experience that showcases core value propositions

**Key Files:**
- `utils/trial.ts` - Trial milestone tracking and management
- `app/(tabs)/index.tsx` - Trial banner and milestone display
- `utils/inAppReview.ts` - Strategic review prompts at key moments

### 10. Tone Personalization System
Advanced content personalization that adapts to user preferences:

- **Multiple Tone Options**: Warm, crisp, and coach tone variations
- **Dynamic Phrase Selection**: Contextual language that matches user style
- **User Preference Learning**: Tone selection that adapts over time
- **Brand Consistency**: Maintains app personality while offering variety
- **A/B Testing Ready**: Tone system supports experimentation and optimization

**Key Files:**
- `utils/advisor/tone.ts` - Tone system implementation with phrase banks
- `app/components/LabsToneSelector.tsx` - Tone selection interface in Labs
- `app/(tabs)/settings.tsx` - Tone selector integration in settings

## Competitive Advantages

### vs. Traditional Mood Trackers (Daylio, Moodnotes)
- **Actionable Insights**: We don't just show data, we explain what it means
- **Relationship Focus**: Partner insights create shared accountability
- **AI-Powered Guidance**: Personalized recommendations vs. generic advice

### vs. AI Wellness Apps (Woebot, Wysa)
- **Explainable AI**: Users understand why recommendations are made
- **Mood-Activity Correlation**: Links behaviors to emotional states
- **Relationship Integration**: Couples can use together effectively

### vs. Relationship Apps (Paired, Lasting)
- **Emotional Intelligence**: Mood tracking provides relationship context
- **Data-Driven Insights**: Evidence-based relationship guidance
- **Individual + Couple**: Personal growth supports relationship health

## Technical Excellence

### Performance Optimization
- **Lazy Loading**: Insights generated on-demand
- **Efficient State Management**: Zustand with selective subscriptions
- **Smart Caching**: Cooldown system prevents unnecessary computations

### Privacy & Security
- **Local Processing**: Core algorithms run on-device
- **Encrypted Storage**: Sensitive data protected at rest
- **Minimal Data Collection**: Only essential information stored

### Scalability
- **Modular Architecture**: Easy to add new insight types
- **Template System**: Scalable content generation
- **Feature Flags**: Gradual rollout of new capabilities
- **A/B Testing Infrastructure**: Built-in support for experimentation
- **Progressive Enhancement**: Features unlock based on user engagement

### Feature Management & Experimentation
- **Feature Flags System**: Granular control over feature rollout
- **Advisor Feed Toggle**: Experimental AI insights with user control
- **Labs Section**: Advanced features for power users and testing
- **Tone System**: User-selectable content personality
- **Future-Ready Architecture**: Support for TinyML and RAG integration

**Key Files:**
- `utils/featureFlags.ts` - Feature flag management system
- `constants/flags.ts` - Feature flag definitions
- `app/components/LabsToneSelector.tsx` - Labs section components

## Future Roadmap

### Phase 2: Advanced AI
- **Natural Language Processing**: More conversational insight delivery
- **Machine Learning Integration(Tinyml)**: Continuous algorithm improvement

### Phase 3: Ecosystem Expansion
- **Wearable Integration**: Real-time mood monitoring
- **Professional Tools**: AI Therapist/AI coach tabs within the app


## Conclusion

Mindful Moment represents a paradigm shift in emotional well-being applications. By combining the familiarity of traditional mood tracking with the power of explainable AI, we provide users with insights that are both understandable and actionable. Our proprietary algorithms don't just analyze data - they translate it into meaningful guidance that empowers users to take control of their emotional well-being and relationships.

The key to our success lies in the balance we've achieved: users get the data visualization they expect, plus the explainable insights that provide new dimensions of understanding. This approach makes our app accessible to users familiar with traditional tracking while delivering the innovative AI-powered guidance that sets us apart in the market.
