import SwiftUI

struct CourseDetailView: View {
    let task: TaskItem
    @Environment(\.dismiss) private var dismiss

    // Simulated module data — in production this would come from the API
    private let modules: [CourseModule] = CourseModule.sample

    var body: some View {
        ZStack(alignment: .bottom) {
            AppColors.offWhiteBg.ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.sectionSpacing) {
                    courseHeaderCard
                    curriculumSection
                }
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.bottom, AppTheme.tabBarHeight + AppTheme.ctaHeight + 24)
            }

            continueLearningCTA
        }
        .navigationTitle(task.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                HStack(spacing: 12) {
                    BadgeView(text: task.priority + " PRIORITY", style: badgeStyle)
                    Image(systemName: "bookmark")
                        .foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
    }

    // MARK: - Header Card

    private var courseHeaderCard: some View {
        ZStack(alignment: .bottomLeading) {
            // Dark gradient background
            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                .fill(
                    LinearGradient(
                        colors: [AppColors.darkPurple, AppColors.splashPurple, AppColors.primaryPurple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 12) {
                // Provider logo
                HStack(spacing: 10) {
                    Circle()
                        .fill(AppColors.tealAccent)
                        .frame(width: 36, height: 36)
                        .overlay {
                            Text("C")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    Text("Coursera")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.9))
                }

                Text(task.title)
                    .font(AppTypography.title3)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)

                if let desc = task.description {
                    Text(desc)
                        .font(AppTypography.callout)
                        .foregroundStyle(.white.opacity(0.75))
                        .lineLimit(3)
                }

                // Progress section
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("YOUR PROGRESS 33%")
                            .capsStyle(size: 10, color: .white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(.white.opacity(0.2), in: Capsule())
                        Spacer()
                    }

                    ProgressBarView(
                        progress: 0.33,
                        height: 6,
                        trackColor: .white.opacity(0.3),
                        gradient: LinearGradient(
                            colors: [AppColors.tealLight, AppColors.tealAccent],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )

                    Text("4 of 12 modules completed")
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.8))
                }
            }
            .padding(AppTheme.cardPadding)
        }
        .frame(minHeight: 220)
    }

    // MARK: - Curriculum

    private var curriculumSection: some View {
        CardView {
            HStack {
                Text("Course Curriculum")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Spacer()
                HStack(spacing: 6) {
                    Text("12 Modules")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.grayText)
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(AppColors.inputBg, in: Capsule())
                    Text("18h Total")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.grayText)
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(AppColors.inputBg, in: Capsule())
                }
            }

            Divider()

            VStack(spacing: 0) {
                ForEach(modules) { module in
                    moduleRow(module: module)
                    if module.id != modules.last?.id {
                        Divider().padding(.leading, 44)
                    }
                }
            }
        }
    }

    private func moduleRow(module: CourseModule) -> some View {
        HStack(spacing: 12) {
            // Status icon
            moduleStatusIcon(state: module.state)
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 8) {
                    Text(module.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(module.state == .locked ? AppColors.grayText : AppColors.darkText)
                        .strikethrough(module.state == .completed, color: AppColors.grayText)

                    if module.state == .current {
                        BadgeView(text: "CURRENT", style: .current)
                    }
                }

                if let desc = module.description {
                    Text(desc)
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.grayText)
                        .lineLimit(1)
                }
            }

            Spacer()

            if module.state == .current {
                Button {} label: {
                    Text("Continue")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(AppColors.primaryPurple, in: Capsule())
                }
            }
        }
        .padding(.vertical, 12)
        .overlay(alignment: .leading) {
            if module.state == .current {
                Rectangle()
                    .fill(AppColors.primaryPurple)
                    .frame(width: 3)
                    .clipShape(Capsule())
                    .offset(x: -AppTheme.cardPadding)
            }
        }
    }

    @ViewBuilder
    private func moduleStatusIcon(state: CourseModule.State) -> some View {
        switch state {
        case .completed:
            Circle()
                .fill(AppColors.successGreen.opacity(0.15))
                .overlay {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(AppColors.successGreen)
                }
        case .current:
            Circle()
                .fill(AppColors.primaryPurple.opacity(0.12))
                .overlay {
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(AppColors.primaryPurple)
                }
        case .locked:
            Circle()
                .fill(AppColors.inputBg)
                .overlay {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.grayText)
                }
        }
    }

    // MARK: - CTA

    private var continueLearningCTA: some View {
        VStack(spacing: 0) {
            Divider()
            PillButton(title: "Continue Learning", icon: "play.fill") {}
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

// MARK: - CourseModule model

struct CourseModule: Identifiable {
    enum State { case completed, current, locked }
    let id: String
    let title: String
    let description: String?
    let state: State

    static let sample: [CourseModule] = [
        .init(id: "01", title: "01. Introduction to Relational Databases",
              description: "Fundamentals of database design and structure",
              state: .completed),
        .init(id: "05", title: "05. Filtering & Aggregating Data",
              description: "WHERE clauses, GROUP BY, HAVING",
              state: .current),
        .init(id: "06", title: "06. Advanced Table Joins",
              description: nil, state: .locked),
        .init(id: "07", title: "07. Subqueries and Common Table Expressions",
              description: nil, state: .locked)
    ]
}
