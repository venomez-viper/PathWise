import SwiftUI

struct AssessmentIntroView: View {
    let onBegin: () -> Void
    let onSkip: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                Circle().fill(AppColors.lavenderBg).frame(width: 80, height: 80)
                Image(systemName: "brain.head.profile").font(.system(size: 36)).foregroundStyle(AppColors.primaryPurple)
            }

            Text("Let's find your career fit").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
            Text("This quick assessment evaluates your skills, interests, and personality to match you with the right career paths.")
                .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)

            HStack(spacing: 24) {
                Label("~5 minutes", systemImage: "circle.fill").font(.system(size: 12)).foregroundStyle(AppColors.successGreen)
                Label("20 questions", systemImage: "doc.text").font(.system(size: 12)).foregroundStyle(AppColors.grayText)
                Label("AI-analyzed", systemImage: "sparkles").font(.system(size: 12)).foregroundStyle(AppColors.grayText)
            }

            PillButton(title: "Begin Assessment") { onBegin() }.padding(.horizontal, AppTheme.screenPadding)
            Button("I'll do this later") { onSkip() }
                .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.grayText)

            Spacer()
        }
        .background(AppColors.offWhiteBg)
    }
}
