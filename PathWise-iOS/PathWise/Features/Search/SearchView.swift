import SwiftUI

struct SearchView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel = SearchViewModel()
    @FocusState private var searchFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                searchBar
                if viewModel.query.trimmingCharacters(in: .whitespaces).isEmpty {
                    emptyPrompt
                } else if viewModel.hasResults {
                    resultsContent
                } else {
                    noResults
                }
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
            ToolbarItem(placement: .topBarTrailing) {
                avatarCircle
            }
        }
        .task {
            if let user = authManager.currentUser {
                // Load assessment matches for search source data
                do {
                    let assessResp: AssessmentResponse = try await authManager.apiClient.request(.getAssessment(userId: user.id))
                    let taskResp: TaskListResponse = try await authManager.apiClient.request(.listTasks(userId: user.id))
                    viewModel.populate(
                        matches: assessResp.result?.careerMatches ?? [],
                        tasks: taskResp.tasks
                    )
                } catch {
                    // Silently ignore — search still works with empty data
                }
            }
        }
    }

    // MARK: - Avatar

    private var avatarCircle: some View {
        Circle()
            .fill(AppColors.lightPurpleTint)
            .frame(width: 32, height: 32)
            .overlay {
                Text(String(authManager.currentUser?.name.prefix(1) ?? "?"))
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppColors.primaryPurple)
            }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(searchFocused ? AppColors.primaryPurple : AppColors.grayText)
                .font(.system(size: 16))

            TextField("Search roles, courses, skills...", text: $viewModel.query)
                .font(AppTypography.body)
                .foregroundStyle(AppColors.darkText)
                .focused($searchFocused)
                .submitLabel(.search)

            if !viewModel.query.isEmpty {
                Button {
                    viewModel.clearQuery()
                    searchFocused = false
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(AppColors.grayText)
                        .font(.system(size: 16))
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(.white, in: RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(searchFocused ? AppColors.primaryPurple : AppColors.lightGrayBorder, lineWidth: 1.5)
        )
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }

    // MARK: - Empty Prompt

    private var emptyPrompt: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundStyle(AppColors.grayText.opacity(0.3))
            Text("Search roles, courses, and skills")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    // MARK: - No Results

    private var noResults: some View {
        VStack(spacing: 12) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.grayText.opacity(0.4))
            Text("No results for \"\(viewModel.query)\"")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }

    // MARK: - Results

    private var resultsContent: some View {
        VStack(spacing: 24) {
            if !viewModel.roleResults.isEmpty {
                rolesSection
            }
            if !viewModel.courseResults.isEmpty {
                coursesSection
            }
            if !viewModel.skillResults.isEmpty {
                skillsSection
            }
        }
    }

    // MARK: - Roles Section

    private var rolesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Text("Roles")
                    .font(AppTypography.title3)
                    .foregroundStyle(AppColors.darkText)
                BadgeView(text: "MATCHES", style: .current)
            }

            VStack(spacing: 10) {
                ForEach(viewModel.roleResults) { role in
                    RoleSearchCard(role: role)
                }
            }
        }
    }

    // MARK: - Courses Section

    private var coursesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Text("Courses")
                    .font(AppTypography.title3)
                    .foregroundStyle(AppColors.darkText)
                BadgeView(text: "GROWTH", style: .current)
            }

            VStack(spacing: 10) {
                ForEach(viewModel.courseResults) { course in
                    CourseSearchCard(course: course)
                }
            }
        }
    }

    // MARK: - Skills Section

    private var skillsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Text("Skills")
                    .font(AppTypography.title3)
                    .foregroundStyle(AppColors.darkText)
                BadgeView(text: "REQUIRED", style: .custom(AppColors.grayText.opacity(0.15), AppColors.grayText))
            }

            FlowLayout(spacing: 8) {
                ForEach(viewModel.skillResults) { skill in
                    SkillChip(skill: skill)
                }
            }
        }
    }
}

// MARK: - Role Search Card

private struct RoleSearchCard: View {
    let role: RoleSearchResult

    var body: some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 10)
                .fill(AppColors.lightPurpleTint)
                .frame(width: 40, height: 40)
                .overlay {
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.primaryPurple)
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(role.title)
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Text(role.opportunities)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(AppColors.grayText)
        }
        .padding(AppTheme.cardPadding)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.cardRadius)
                .stroke(AppColors.primaryPurple.opacity(0.3), style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
        )
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Course Search Card

private struct CourseSearchCard: View {
    let course: CourseSearchResult

    private var iconName: String {
        course.provider.lowercased().contains("data") || course.name.lowercased().contains("sql")
            ? "cylinder.fill"
            : "chart.bar.fill"
    }

    private var iconColor: Color {
        course.level == "Expert Level" ? AppColors.primaryPurple : AppColors.tealAccent
    }

    var body: some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 10)
                .fill(iconColor.opacity(0.15))
                .frame(width: 40, height: 40)
                .overlay {
                    Image(systemName: iconName)
                        .font(.system(size: 16))
                        .foregroundStyle(iconColor)
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(course.name)
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Text("\(course.moduleCount) modules · \(course.provider)")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(AppColors.grayText)
        }
        .padding(AppTheme.cardPadding)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Skill Chip

private struct SkillChip: View {
    let skill: SkillSearchResult

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "chevron.left.forwardslash.chevron.right")
                .font(.system(size: 11))
                .foregroundStyle(AppColors.primaryPurple)
            Text(skill.name)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(AppColors.darkText)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(AppColors.lightPurpleTint, in: Capsule())
    }
}

// MARK: - Flow Layout

private struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 0
        var height: CGFloat = 0
        var rowWidth: CGFloat = 0
        var rowHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if rowWidth + size.width > width, rowWidth > 0 {
                height += rowHeight + spacing
                rowWidth = 0
                rowHeight = 0
            }
            rowWidth += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        height += rowHeight
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX, x > bounds.minX {
                y += rowHeight + spacing
                x = bounds.minX
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        SearchView()
    }
    .environment(AuthManager())
}
