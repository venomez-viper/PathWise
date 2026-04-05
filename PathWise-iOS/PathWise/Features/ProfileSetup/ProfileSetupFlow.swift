import SwiftUI

struct ProfileSetupFlow: View {
    @Environment(AuthManager.self) private var authManager
    @State private var step = 0
    @State private var currentRole = ""
    @State private var experience = ""
    @State private var education = ""
    @State private var selectedIndustries: Set<String> = []
    @State private var selectedGoalRole = ""
    @State private var selectedTimeline = "6m"
    @State private var selectedValues: Set<String> = []
    @Binding var isComplete: Bool

    var body: some View {
        NavigationStack {
            Group {
                switch step {
                case 0: AboutYouView(currentRole: $currentRole, experience: $experience, education: $education, selectedIndustries: $selectedIndustries, onContinue: { step = 1 }, onSkip: { step = 1 })
                case 1: YourGoalsView(selectedRole: $selectedGoalRole, selectedTimeline: $selectedTimeline, selectedValues: $selectedValues, onContinue: { step = 2 }, onSkip: { step = 2 })
                default: PhotoUploadView(onComplete: { isComplete = true }, onSkip: { isComplete = true })
                }
            }
        }
    }
}
