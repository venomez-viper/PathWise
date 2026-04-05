import SwiftUI

// MARK: - Skill Readiness Level

enum SkillReadinessLevel {
    case expert, moderate, gap

    var label: String {
        switch self {
        case .expert: return "EXPERT"
        case .moderate: return "MODERATE"
        case .gap: return "GAP"
        }
    }

    var badgeColor: Color {
        switch self {
        case .expert: return AppColors.successGreen
        case .moderate: return AppColors.warningAmber
        case .gap: return AppColors.highPriorityRed
        }
    }

    var badgeBg: Color {
        switch self {
        case .expert: return AppColors.successGreen.opacity(0.12)
        case .moderate: return AppColors.warningAmber.opacity(0.12)
        case .gap: return AppColors.highPriorityRed.opacity(0.12)
        }
    }

    var borderColor: Color { badgeColor }

    var icon: String {
        switch self {
        case .expert: return "chart.bar.fill"
        case .moderate: return "list.bullet"
        case .gap: return "chevron.left.forwardslash.chevron.right"
        }
    }
}

struct SkillReadinessItem: Identifiable {
    let id = UUID()
    let skillName: String
    let detail: String
    let level: SkillReadinessLevel
}

// MARK: - Career Match Detail View

struct CareerMatchDetailView: View {
    let match: CareerMatch
    var onSetTarget: (() -> Void)? = nil
    var onCompare: (() -> Void)? = nil

    // Derived salary benchmarks from match score (placeholder heuristic)
    private var salaryLow: String { "$55K" }
    private var salaryMedian: String { "$72K" }
    private var salaryHigh: String { "$95K" }

    // Why this fits — generated from requiredSkills or default bullets
    private var fitReasons: [String] {
        let skills = match.requiredSkills
        if skills.count >= 2 {
            return [
                "Your strong foundation in **\(skills[0])** aligns perfectly with the diagnostic nature of this role.",
                "Demonstrated ability in **\(skills.count > 1 ? skills[1] : skills[0])** strategies observed in your recent projects.",
                "The role's focus on trend forecasting matches your interest in predictive consumer behavior."
            ]
        }
        return [
            "Your analytical strengths align perfectly with the diagnostic nature of this role.",
            "Demonstrated ability in data-driven strategies observed in your recent projects.",
            "The role's focus on trend forecasting matches your interest in predictive consumer behavior."
        ]
    }

    // Skill readiness — uses first 3 required skills
    private var skillsReadiness: [SkillReadinessItem] {
        let skills = match.requiredSkills
        let levels: [SkillReadinessLevel] = [.expert, .moderate, .gap]
        let details = ["Ready for advanced modeling.", "Basic queries mastered.", "Automation path required."]
        return (0..<min(3, skills.count)).map { i in
            SkillReadinessItem(skillName: skills[i], detail: details[i % details.count], level: levels[i % levels.count])
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                heroCard
                whyItFitsSection
                salaryBenchmarksCard
                if !skillsReadiness.isEmpty {
                    skillsReadinessSection
                }
                ctaSection
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 16)
        }
        .background(AppColors.offWhiteBg)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                HStack(spacing: 6) {
                    Image(systemName: "book.fill").foregroundStyle(AppColors.primaryPurple)
                    Text("PathWise")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
    }

    // MARK: Hero Card

    private var heroCard: some View {
        CardView {
            VStack(spacing: 14) {
                // Donut + match score
                ZStack {
                    Circle()
                        .stroke(AppColors.tealAccent.opacity(0.15), lineWidth: 12)
                        .frame(width: 108, height: 108)
                    Circle()
                        .trim(from: 0, to: CGFloat(match.matchScore) / 100.0)
                        .stroke(
                            AngularGradient(colors: [AppColors.tealAccent, AppColors.tealLight], center: .center),
                            style: StrokeStyle(lineWidth: 12, lineCap: .round)
                        )
                        .frame(width: 108, height: 108)
                        .rotationEffect(.degrees(-90))
                    VStack(spacing: 0) {
                        Text("\(match.matchScore)%")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundStyle(AppColors.darkText)
                        Text("MATCH")
                            .font(.system(size: 10, weight: .bold))
                            .tracking(1.5)
                            .foregroundStyle(AppColors.grayText)
                    }
                }

                BadgeView(text: "BEST MATCH", style: .bestMatch)

                Text(match.title)
                    .font(AppTypography.title1)
                    .foregroundStyle(AppColors.darkText)
                    .multilineTextAlignment(.center)

                Text(match.description)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: Why This Fits

    private var whyItFitsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                Circle()
                    .fill(AppColors.lightPurpleTint)
                    .frame(width: 32, height: 32)
                    .overlay {
                        Image(systemName: "sparkles")
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.primaryPurple)
                    }
                Text("Why this fits you")
                    .font(AppTypography.title3)
                    .foregroundStyle(AppColors.darkText)
            }

            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(fitReasons.enumerated()), id: \.offset) { _, reason in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 18))
                            .foregroundStyle(AppColors.successGreen)
                            .frame(width: 20)
                        fitReasonText(reason)
                    }
                }
            }
        }
        .padding(AppTheme.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }

    /// Renders markdown-style **bold** inline
    private func fitReasonText(_ raw: String) -> some View {
        // Split by ** pairs and render alternating plain/bold runs
        let parts = raw.components(separatedBy: "**")
        var result = Text("")
        for (i, part) in parts.enumerated() {
            if i.isMultiple(of: 2) {
                result = result + Text(part).font(AppTypography.callout).foregroundStyle(AppColors.darkText)
            } else {
                result = result + Text(part).font(.system(size: 14, weight: .semibold)).foregroundStyle(AppColors.darkText)
            }
        }
        return result
    }

    // MARK: Salary Benchmarks

    private var salaryBenchmarksCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Salary Benchmarks")
                .font(AppTypography.title3)
                .foregroundStyle(AppColors.darkText)

            HStack(alignment: .bottom) {
                // LOW
                VStack(spacing: 4) {
                    Text("LOW")
                        .capsStyle(size: 10, color: AppColors.grayText)
                    Text(salaryLow)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.grayText)
                }
                .frame(maxWidth: .infinity)

                // MEDIAN
                VStack(spacing: 4) {
                    Text("MEDIAN")
                        .capsStyle(size: 10, color: AppColors.primaryPurple)
                    Text(salaryMedian)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(AppColors.darkText)
                }
                .frame(maxWidth: .infinity)

                // HIGH
                VStack(spacing: 4) {
                    Text("HIGH")
                        .capsStyle(size: 10, color: AppColors.grayText)
                    Text(salaryHigh)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.grayText)
                }
                .frame(maxWidth: .infinity)
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(AppColors.lavenderBg, in: RoundedRectangle(cornerRadius: 12))

            Text("Based on national market data")
                .font(AppTypography.caption2)
                .foregroundStyle(AppColors.grayText)
        }
        .padding(AppTheme.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }

    // MARK: Skills Readiness

    private var skillsReadinessSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Skills Readiness")
                .font(AppTypography.title3)
                .foregroundStyle(AppColors.darkText)

            VStack(spacing: 10) {
                ForEach(skillsReadiness) { item in
                    skillReadinessRow(item)
                }
            }
        }
        .padding(AppTheme.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }

    private func skillReadinessRow(_ item: SkillReadinessItem) -> some View {
        HStack(spacing: 12) {
            Image(systemName: item.level.icon)
                .font(.system(size: 16))
                .foregroundStyle(item.level.badgeColor)
                .frame(width: 32, height: 32)
                .background(item.level.badgeBg, in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(item.skillName)
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Text(item.detail)
                    .font(AppTypography.caption1)
                    .foregroundStyle(AppColors.grayText)
            }

            Spacer()

            Text(item.level.label)
                .font(.system(size: 10, weight: .bold))
                .tracking(0.5)
                .foregroundStyle(item.level.badgeColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(item.level.badgeBg, in: Capsule())
        }
        .padding(12)
        .background(.white, in: RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(item.level.borderColor.opacity(0.4), lineWidth: 1)
        )
        .overlay(
            // Bottom accent border
            Rectangle()
                .fill(item.level.borderColor)
                .frame(height: 3)
                .clipShape(RoundedRectangle(cornerRadius: 2)),
            alignment: .bottom
        )
    }

    // MARK: CTA

    private var ctaSection: some View {
        VStack(spacing: 14) {
            PillButton(title: "Set as My Target Role", icon: "target") {
                onSetTarget?()
            }

            Button {
                onCompare?()
            } label: {
                Text("Compare with another role")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AppColors.primaryPurple)
            }
        }
        .padding(.bottom, 8)
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        CareerMatchDetailView(
            match: CareerMatch(
                title: "Marketing Analyst",
                matchScore: 88,
                description: "Harness the power of data to drive consumer engagement and brand growth.",
                requiredSkills: ["Excel", "SQL", "Python"],
                pathwayTime: "6 months"
            )
        )
    }
}
