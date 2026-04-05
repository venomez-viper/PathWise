// PathWise-iOS/PathWise/Features/Assessment/AssessmentViewModel.swift
import Foundation
import Observation

@Observable
class AssessmentViewModel {
    let api: APIClient
    let userId: String

    var currentStep = 0
    var answers: [String: String] = [:]
    var selectedOptions: [Int: Int] = [:] // step -> selected index
    var isProcessing = false
    var processingProgress: Double = 0
    var processingStep = 0
    var result: AssessmentResult?
    var error: String?

    // Assessment question data
    let questions: [AssessmentQuestion] = AssessmentQuestion.all

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    var totalQuestions: Int { questions.count }
    var currentQuestion: AssessmentQuestion? {
        guard currentStep < questions.count else { return nil }
        return questions[currentStep]
    }

    var canContinue: Bool {
        selectedOptions[currentStep] != nil
    }

    func selectOption(_ index: Int) {
        selectedOptions[currentStep] = index
        if let q = currentQuestion {
            answers[q.key] = q.options[index].value
        }
    }

    func next() {
        if currentStep < questions.count - 1 {
            currentStep += 1
        } else {
            submit()
        }
    }

    func previous() {
        if currentStep > 0 {
            currentStep -= 1
        }
    }

    private func submit() {
        isProcessing = true
        processingProgress = 0
        processingStep = 0

        Task {
            // Animate processing steps
            for step in 0..<3 {
                try? await Task.sleep(for: .seconds(1))
                await MainActor.run {
                    processingStep = step + 1
                    processingProgress = Double(step + 1) / 4.0
                }
            }

            do {
                let request = SubmitAssessmentRequest(
                    userId: userId,
                    workStyle: answers["workStyle"] ?? "",
                    strengths: extractList("strengths"),
                    values: extractList("values"),
                    currentSkills: extractList("skills"),
                    experienceLevel: answers["experienceLevel"] ?? "mid",
                    interests: extractList("interests"),
                    currentRole: answers["currentRole"],
                    personalityType: nil,
                    rawAnswers: answers
                )

                let response: AssessmentResponse = try await api.request(.submitAssessment, body: request)
                await MainActor.run {
                    result = response.result
                    processingProgress = 1.0
                    isProcessing = false
                }
            } catch {
                await MainActor.run {
                    self.error = error.localizedDescription
                    isProcessing = false
                }
            }
        }
    }

    private func extractList(_ prefix: String) -> [String] {
        answers.filter { $0.key.hasPrefix(prefix) }.map(\.value)
    }
}

struct AssessmentQuestion: Identifiable {
    let id = UUID()
    let key: String
    let category: String
    let text: String
    let options: [AssessmentOption]

    static let all: [AssessmentQuestion] = [
        AssessmentQuestion(
            key: "interests_1",
            category: "Interests",
            text: "Which of these activities energizes you most?",
            options: [
                AssessmentOption(text: "Analyzing trends in data", value: "analytical", icon: "chart.bar"),
                AssessmentOption(text: "Presenting ideas to a team", value: "social", icon: "person.3"),
                AssessmentOption(text: "Designing visual layouts", value: "creative", icon: "paintpalette"),
                AssessmentOption(text: "Writing strategic plans", value: "strategic", icon: "doc.text"),
            ]
        ),
        AssessmentQuestion(
            key: "interests_2",
            category: "Interests",
            text: "What type of problem do you enjoy solving?",
            options: [
                AssessmentOption(text: "Optimizing systems and processes", value: "systems", icon: "gearshape.2"),
                AssessmentOption(text: "Understanding people and behavior", value: "human", icon: "brain.head.profile"),
                AssessmentOption(text: "Building something from scratch", value: "builder", icon: "hammer"),
                AssessmentOption(text: "Finding patterns in complexity", value: "pattern", icon: "square.grid.3x3"),
            ]
        ),
        AssessmentQuestion(
            key: "interests_3",
            category: "Interests",
            text: "Which scenario excites you most?",
            options: [
                AssessmentOption(text: "Launching a product to market", value: "launcher", icon: "rocket"),
                AssessmentOption(text: "Mentoring a junior colleague", value: "mentor", icon: "person.badge.plus"),
                AssessmentOption(text: "Deep-diving into a research paper", value: "researcher", icon: "book"),
                AssessmentOption(text: "Negotiating a partnership deal", value: "negotiator", icon: "handshake"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_1",
            category: "Work Style",
            text: "How do you prefer to make decisions?",
            options: [
                AssessmentOption(text: "Data-driven analysis", value: "data-driven", icon: "chart.pie"),
                AssessmentOption(text: "Gut feeling and intuition", value: "intuitive", icon: "sparkles"),
                AssessmentOption(text: "Group consensus", value: "collaborative", icon: "bubble.left.and.bubble.right"),
                AssessmentOption(text: "Expert consultation", value: "consultative", icon: "person.wave.2"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_2",
            category: "Work Style",
            text: "What's your ideal team dynamic?",
            options: [
                AssessmentOption(text: "Independent work with check-ins", value: "independent", icon: "person"),
                AssessmentOption(text: "Highly collaborative, always pairing", value: "pair", icon: "person.2"),
                AssessmentOption(text: "Small focused squad", value: "squad", icon: "person.3"),
                AssessmentOption(text: "Leading a large team", value: "leader", icon: "person.3.sequence"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_3",
            category: "Work Style",
            text: "How do you handle ambiguity?",
            options: [
                AssessmentOption(text: "Create structure and process", value: "structured", icon: "list.bullet.rectangle"),
                AssessmentOption(text: "Embrace it and experiment", value: "explorer", icon: "safari"),
                AssessmentOption(text: "Seek clarity before acting", value: "clarifier", icon: "magnifyingglass"),
                AssessmentOption(text: "Take decisive action quickly", value: "decisive", icon: "bolt"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_4",
            category: "Work Style",
            text: "What pace energizes you?",
            options: [
                AssessmentOption(text: "Fast-paced startup energy", value: "fast", icon: "hare"),
                AssessmentOption(text: "Steady, sustainable rhythm", value: "steady", icon: "metronome"),
                AssessmentOption(text: "Deep focus, few interruptions", value: "deep", icon: "moon.stars"),
                AssessmentOption(text: "Varied — different every day", value: "varied", icon: "shuffle"),
            ]
        ),
        AssessmentQuestion(
            key: "values_1",
            category: "Values",
            text: "What matters most in your career?",
            options: [
                AssessmentOption(text: "Financial security and growth", value: "financial", icon: "dollarsign.circle"),
                AssessmentOption(text: "Making a positive impact", value: "impact", icon: "heart"),
                AssessmentOption(text: "Continuous learning", value: "learning", icon: "graduationcap"),
                AssessmentOption(text: "Work-life balance", value: "balance", icon: "scale.3d"),
            ]
        ),
        AssessmentQuestion(
            key: "values_2",
            category: "Values",
            text: "What frustrates you most at work?",
            options: [
                AssessmentOption(text: "Bureaucracy and red tape", value: "bureaucracy", icon: "exclamationmark.triangle"),
                AssessmentOption(text: "Lack of creative freedom", value: "freedom", icon: "lock"),
                AssessmentOption(text: "Poor communication", value: "communication", icon: "bubble.left.and.exclamationmark.bubble.right"),
                AssessmentOption(text: "Stagnation and no growth", value: "stagnation", icon: "arrow.down.right"),
            ]
        ),
        AssessmentQuestion(
            key: "values_3",
            category: "Values",
            text: "Which trade-off would you accept?",
            options: [
                AssessmentOption(text: "Less pay for more meaning", value: "meaning-over-pay", icon: "heart.circle"),
                AssessmentOption(text: "More stress for faster growth", value: "growth-over-comfort", icon: "arrow.up.forward"),
                AssessmentOption(text: "Less prestige for more freedom", value: "freedom-over-prestige", icon: "bird"),
                AssessmentOption(text: "More routine for more stability", value: "stability-over-variety", icon: "house"),
            ]
        ),
        AssessmentQuestion(
            key: "values_4",
            category: "Values",
            text: "What reward feels most satisfying?",
            options: [
                AssessmentOption(text: "Public recognition", value: "recognition", icon: "star"),
                AssessmentOption(text: "Solving a hard problem", value: "mastery", icon: "puzzlepiece"),
                AssessmentOption(text: "Helping someone succeed", value: "helping", icon: "hands.sparkles"),
                AssessmentOption(text: "Building something lasting", value: "legacy", icon: "building.columns"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_1",
            category: "Environment",
            text: "What's your ideal work setting?",
            options: [
                AssessmentOption(text: "Fully remote", value: "remote", icon: "house.lodge"),
                AssessmentOption(text: "Hybrid (mix of home and office)", value: "hybrid", icon: "arrow.triangle.swap"),
                AssessmentOption(text: "In-office with colleagues", value: "office", icon: "building.2"),
                AssessmentOption(text: "On-site / fieldwork", value: "fieldwork", icon: "map"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_2",
            category: "Environment",
            text: "What team size do you prefer?",
            options: [
                AssessmentOption(text: "Solo or 2-3 people", value: "tiny", icon: "person"),
                AssessmentOption(text: "Small team (4-8)", value: "small", icon: "person.2"),
                AssessmentOption(text: "Medium team (9-20)", value: "medium", icon: "person.3"),
                AssessmentOption(text: "Large organization (20+)", value: "large", icon: "person.3.sequence"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_3",
            category: "Environment",
            text: "What management style suits you?",
            options: [
                AssessmentOption(text: "Hands-off — trust me to deliver", value: "autonomous", icon: "hand.raised.slash"),
                AssessmentOption(text: "Regular check-ins and feedback", value: "coaching", icon: "bubble.left.and.bubble.right"),
                AssessmentOption(text: "Clear structure and expectations", value: "structured", icon: "checklist"),
                AssessmentOption(text: "Collaborative — manager as partner", value: "partner", icon: "person.2.circle"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_4",
            category: "Environment",
            text: "How important is company culture?",
            options: [
                AssessmentOption(text: "Critical — it's my top priority", value: "critical", icon: "heart.fill"),
                AssessmentOption(text: "Important, but role matters more", value: "important", icon: "star.leadinghalf.filled"),
                AssessmentOption(text: "Nice to have", value: "moderate", icon: "hand.thumbsup"),
                AssessmentOption(text: "I focus on the work itself", value: "work-focused", icon: "briefcase"),
            ]
        ),
        AssessmentQuestion(
            key: "career_1",
            category: "Career Stage",
            text: "Where are you in your career?",
            options: [
                AssessmentOption(text: "Just starting out", value: "entry", icon: "sunrise"),
                AssessmentOption(text: "Early career (1-3 years)", value: "early", icon: "sun.max"),
                AssessmentOption(text: "Mid-career (4-8 years)", value: "mid", icon: "sun.haze"),
                AssessmentOption(text: "Senior / leadership (8+ years)", value: "senior", icon: "crown"),
            ]
        ),
        AssessmentQuestion(
            key: "career_2",
            category: "Career Stage",
            text: "What's your risk tolerance for career moves?",
            options: [
                AssessmentOption(text: "High — I'll bet on myself", value: "high-risk", icon: "flame"),
                AssessmentOption(text: "Moderate — calculated risks", value: "moderate-risk", icon: "scale.3d"),
                AssessmentOption(text: "Low — prefer stability", value: "low-risk", icon: "shield"),
                AssessmentOption(text: "Depends on the opportunity", value: "situational", icon: "questionmark.circle"),
            ]
        ),
        AssessmentQuestion(
            key: "career_3",
            category: "Career Stage",
            text: "What career trajectory appeals to you?",
            options: [
                AssessmentOption(text: "Individual contributor / expert", value: "ic", icon: "star.circle"),
                AssessmentOption(text: "People manager / leader", value: "manager", icon: "person.3.fill"),
                AssessmentOption(text: "Entrepreneur / founder", value: "founder", icon: "lightbulb"),
                AssessmentOption(text: "Freelance / independent", value: "freelance", icon: "figure.walk"),
            ]
        ),
        AssessmentQuestion(
            key: "career_4",
            category: "Career Stage",
            text: "In a group project, what's your natural role?",
            options: [
                AssessmentOption(text: "The strategist — planning the approach", value: "strategist", icon: "map"),
                AssessmentOption(text: "The executor — getting things done", value: "executor", icon: "hammer"),
                AssessmentOption(text: "The connector — bringing people together", value: "connector", icon: "link"),
                AssessmentOption(text: "The innovator — generating ideas", value: "innovator", icon: "lightbulb"),
            ]
        ),
        AssessmentQuestion(
            key: "skills_experience",
            category: "Skills & Experience",
            text: "What's your experience level?",
            options: [
                AssessmentOption(text: "Student / Career changer", value: "beginner", icon: "book"),
                AssessmentOption(text: "Junior (0-2 years)", value: "junior", icon: "leaf"),
                AssessmentOption(text: "Mid-level (3-5 years)", value: "mid", icon: "tree"),
                AssessmentOption(text: "Senior (6+ years)", value: "senior", icon: "mountain.2"),
            ]
        ),
    ]
}

struct AssessmentOption: Identifiable {
    let id = UUID()
    let text: String
    let value: String
    let icon: String
}
