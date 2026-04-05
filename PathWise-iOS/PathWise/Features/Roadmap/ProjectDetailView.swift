import SwiftUI

struct ProjectDetailView: View {
    let task: TaskItem
    @Environment(\.dismiss) private var dismiss

    @State private var checkedObjectives: Set<Int> = []
    @State private var isCompleting = false

    // Sample objectives — in production derived from task details or API
    private let objectives: [String] = [
        "Source dataset from Kaggle Marketplace Analytics",
        "Perform Python-based data cleaning and ETL",
        "Create 3 interactive visualizations (Tableau or Seaborn)",
        "Publish Summary Report on GitHub Portfolio"
    ]

    private let resources: [ProjectResource] = [
        .init(icon: "doc.text.fill", title: "Dataset: E-comm 2024", source: "kaggle.com"),
        .init(icon: "play.rectangle.fill", title: "Python Cleaning Tutorial", source: "Course Module 4.2"),
        .init(icon: "doc.fill", title: "Viz Best Practices", source: "PDF Guide, 2.4MB")
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            AppColors.offWhiteBg.ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.sectionSpacing) {
                    projectHeaderCard
                    objectivesSection
                    infoCardsSection
                    resourcesSection
                    mentorLink
                }
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.bottom, AppTheme.tabBarHeight + AppTheme.ctaHeight + 24)
            }

            markCompleteCTA
        }
        .navigationTitle(task.title)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Header Card

    private var projectHeaderCard: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(hex: "EDE9FE"),
                            Color(hex: "FDF2FF"),
                            Color(hex: "F5F3FF")
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 10) {
                BadgeView(text: task.priority + " PRIORITY", style: badgeStyle)

                Text(task.title)
                    .font(AppTypography.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(AppColors.darkText)

                if let desc = task.description, !desc.isEmpty {
                    Text(desc)
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                        .lineLimit(4)
                }
            }
            .padding(AppTheme.cardPadding)
        }
        .frame(minHeight: 180)
    }

    // MARK: - Objectives

    private var objectivesSection: some View {
        CardView {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(AppColors.primaryPurple)
                Text("Project Objectives")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
            }

            VStack(alignment: .leading, spacing: 12) {
                ForEach(objectives.indices, id: \.self) { i in
                    objectiveRow(index: i, text: objectives[i])
                }
            }
        }
    }

    private func objectiveRow(index: Int, text: String) -> some View {
        let isChecked = checkedObjectives.contains(index)
        return Button {
            if isChecked {
                checkedObjectives.remove(index)
            } else {
                checkedObjectives.insert(index)
            }
        } label: {
            HStack(alignment: .top, spacing: 12) {
                // Square checkbox
                RoundedRectangle(cornerRadius: 4)
                    .stroke(isChecked ? AppColors.successGreen : AppColors.lightGrayBorder, lineWidth: 1.5)
                    .frame(width: 20, height: 20)
                    .background(
                        isChecked ? AppColors.successGreen : .clear,
                        in: RoundedRectangle(cornerRadius: 4)
                    )
                    .overlay {
                        if isChecked {
                            Image(systemName: "checkmark")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }

                Text(text)
                    .font(AppTypography.callout)
                    .foregroundStyle(isChecked ? AppColors.grayText : AppColors.darkText)
                    .strikethrough(isChecked, color: AppColors.grayText)
                    .multilineTextAlignment(.leading)

                Spacer()
            }
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isChecked)
    }

    // MARK: - Info Cards

    private var infoCardsSection: some View {
        HStack(spacing: 12) {
            infoCard(
                icon: "clock.fill",
                iconColor: AppColors.primaryPurple,
                bg: AppColors.lavenderBg,
                title: "Estimated Time",
                value: "12-15 Hours of focused work"
            )
            infoCard(
                icon: "pin.fill",
                iconColor: AppColors.successGreen,
                bg: AppColors.tealAccent.opacity(0.08),
                title: "Skills Gained",
                value: "Pandas, Matplotlib, Data Wrangling"
            )
        }
    }

    private func infoCard(icon: String, iconColor: Color, bg: Color, title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundStyle(iconColor)
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(AppColors.grayText)
            }
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.darkText)
                .lineLimit(3)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(bg, in: RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Resources

    private var resourcesSection: some View {
        CardView {
            HStack(spacing: 8) {
                Image(systemName: "doc.fill")
                    .foregroundStyle(AppColors.primaryPurple)
                Text("Resources")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
            }

            VStack(spacing: 10) {
                ForEach(resources) { resource in
                    resourceRow(resource: resource)
                }
            }
        }
    }

    private func resourceRow(resource: ProjectResource) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "link.circle.fill")
                .font(.system(size: 20))
                .foregroundStyle(AppColors.tealAccent)

            VStack(alignment: .leading, spacing: 2) {
                Text(resource.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(AppColors.darkText)
                Text(resource.source)
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.grayText)
            }

            Spacer()

            Image(systemName: "arrow.up.right.square")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.primaryPurple)
        }
        .padding(12)
        .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: 10))
    }

    // MARK: - Mentor Link

    private var mentorLink: some View {
        Button {} label: {
            Text("Stuck on the cleaning phase? ")
                .foregroundStyle(AppColors.grayText)
            + Text("Ask a Mentor")
                .foregroundStyle(AppColors.primaryPurple)
        }
        .font(AppTypography.callout)
        .frame(maxWidth: .infinity)
        .multilineTextAlignment(.center)
    }

    // MARK: - CTA

    private var markCompleteCTA: some View {
        VStack(spacing: 0) {
            Divider()
            PillButton(
                title: "Mark as Complete",
                icon: "checkmark.seal.fill",
                isLoading: isCompleting
            ) {
                isCompleting = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    isCompleting = false
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 16)
            .background(.white)
        }
    }

    // MARK: - Helpers

    private var badgeStyle: BadgeStyle {
        switch task.priority.lowercased() {
        case "high":   return .highPriority
        case "medium": return .mediumPriority
        case "low":    return .lowPriority
        default:       return .lowPriority
        }
    }
}

// MARK: - Supporting Models

struct ProjectResource: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let source: String
}
