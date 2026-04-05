import SwiftUI

struct AssessmentResultsView: View {
    let result: AssessmentResult
    let onViewRoadmap: () -> Void
    let onRetake: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                HStack(spacing: 4) {
                    Image(systemName: "sparkles").foregroundStyle(AppColors.primaryPurple)
                    Text("Your Career Matches").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                }

                Text("Based on your cognitive strengths and professional experience, we've identified the paths where you'll thrive most.")
                    .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center)

                if let topMatch = result.careerMatches.first {
                    CardView {
                        VStack(spacing: 16) {
                            CircularProgressView(progress: Double(topMatch.matchScore) / 100.0, size: 100, progressColor: AppColors.tealAccent)
                            BadgeView(text: "BEST MATCH", style: .bestMatch)
                            Text(topMatch.title).font(AppTypography.title3).foregroundStyle(AppColors.darkText)
                            Text(topMatch.description).font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center)
                            HStack(spacing: 8) {
                                ForEach(topMatch.requiredSkills.prefix(2), id: \.self) { skill in
                                    Text(skill).font(.system(size: 12)).foregroundStyle(AppColors.grayText)
                                        .padding(.horizontal, 12).padding(.vertical, 6)
                                        .background(AppColors.inputBg, in: Capsule())
                                }
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                }

                PillButton(title: "View My Roadmap", icon: "point.topleft.down.to.point.bottomright.curvepath", gradient: AppColors.tealPurpleGradient) { onViewRoadmap() }

                Button { onRetake() } label: {
                    HStack(spacing: 4) { Image(systemName: "arrow.clockwise"); Text("Retake Assessment") }
                        .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.primaryPurple)
                }

                if result.careerMatches.count > 1 {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Other Strong Paths").font(AppTypography.title3).foregroundStyle(AppColors.darkText)
                        ForEach(Array(result.careerMatches.dropFirst()), id: \.title) { match in
                            CardView {
                                HStack(spacing: 16) {
                                    Image(systemName: "chart.bar.fill").font(.system(size: 24)).foregroundStyle(AppColors.primaryPurple)
                                        .frame(width: 40, height: 40).background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: 10))
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(match.title).font(AppTypography.headline).foregroundStyle(AppColors.darkText)
                                        Text(match.description).font(AppTypography.callout).foregroundStyle(AppColors.grayText).lineLimit(1)
                                    }
                                    Spacer()
                                    Text("\(match.matchScore)%").font(.system(size: 16, weight: .bold)).foregroundStyle(AppColors.tealAccent)
                                }
                            }
                        }
                    }
                }
            }
            .padding(AppTheme.screenPadding)
        }
        .background(AppColors.offWhiteBg)
    }
}
