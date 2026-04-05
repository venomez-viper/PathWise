import SwiftUI

struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let highlightedTitle: String
    let description: String
}

struct OnboardingCarouselView: View {
    @Binding var showOnboarding: Bool
    @State private var currentPage = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            icon: "person.crop.circle.badge.questionmark",
            title: "Discover Your",
            highlightedTitle: "Career Identity",
            description: "Take a quick assessment and uncover the career paths that match your unique strengths."
        ),
        OnboardingPage(
            icon: "map.fill",
            title: "Follow Your",
            highlightedTitle: "Personal Roadmap",
            description: "Get an AI-generated career roadmap with milestones, tasks, and timelines tailored to you."
        ),
        OnboardingPage(
            icon: "chart.line.uptrend.xyaxis",
            title: "Track Your",
            highlightedTitle: "Growth Daily",
            description: "Build streaks, earn achievements, and watch your career readiness score climb."
        ),
    ]

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "book.fill").foregroundStyle(AppColors.primaryPurple)
                    Text("PathWise").font(.system(size: 18, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                }
                Spacer()
                Button("SKIP") { showOnboarding = false }
                    .capsStyle(size: 12, color: AppColors.grayText)
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.top, 16)

            TabView(selection: $currentPage) {
                ForEach(Array(pages.enumerated()), id: \.offset) { index, page in
                    VStack(spacing: 24) {
                        Spacer()
                        ZStack {
                            Circle().fill(AppColors.lavenderBg).frame(width: 140, height: 140)
                            Image(systemName: page.icon).font(.system(size: 56)).foregroundStyle(AppColors.primaryPurple)
                        }
                        VStack(spacing: 8) {
                            Text(page.title).font(AppTypography.title1).foregroundStyle(AppColors.darkText)
                            Text(page.highlightedTitle).font(AppTypography.title1).italic().foregroundStyle(AppColors.primaryPurple)
                        }
                        Text(page.description)
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.grayText)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                        Spacer()
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))

            VStack(spacing: 16) {
                PillButton(title: "Get Started") { showOnboarding = false }
                    .padding(.horizontal, AppTheme.screenPadding)
                HStack(spacing: 4) {
                    Text("Already have an account?").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                    Button("Log In") { showOnboarding = false }
                        .font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                }
                .padding(.bottom, 24)
            }
        }
        .background(.white)
    }
}
