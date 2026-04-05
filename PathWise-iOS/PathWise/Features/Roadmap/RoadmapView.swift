import SwiftUI

struct RoadmapView: View {
    @State private var vm: RoadmapViewModel
    @State private var selectedCourse: TaskItem?
    @State private var selectedProject: TaskItem?
    @State private var selectedNetworking: TaskItem?

    init(api: APIClient, userId: String) {
        _vm = State(initialValue: RoadmapViewModel(api: api, userId: userId))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.offWhiteBg.ignoresSafeArea()

                if vm.isLoading {
                    ProgressView()
                        .tint(AppColors.primaryPurple)
                } else {
                    ScrollView {
                        VStack(spacing: AppTheme.sectionSpacing) {
                            targetHeaderCard
                            skillGapCard
                            learningPathSection
                        }
                        .padding(.horizontal, AppTheme.screenPadding)
                        .padding(.bottom, AppTheme.tabBarHeight + 16)
                    }
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { navBar }
            .sheet(isPresented: $vm.showAdjustTimeline) {
                AdjustTimelineSheet(vm: vm)
            }
            .navigationDestination(item: $selectedCourse) { task in
                CourseDetailView(task: task)
            }
            .navigationDestination(item: $selectedProject) { task in
                ProjectDetailView(task: task)
            }
            .navigationDestination(item: $selectedNetworking) { task in
                NetworkingDetailView(task: task)
            }
        }
        .task { await vm.load() }
        .refreshable { await vm.load() }
    }

    // MARK: - Nav Bar

    @ToolbarContentBuilder
    private var navBar: some ToolbarContent {
        ToolbarItem(placement: .navigationBarLeading) {
            HStack(spacing: 6) {
                Image(systemName: "airplane.departure")
                    .foregroundStyle(AppColors.primaryPurple)
                Text("PathWise")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.primaryPurple)
            }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
            Circle()
                .fill(AppColors.lightPurpleTint)
                .frame(width: 36, height: 36)
                .overlay {
                    Image(systemName: "person.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.primaryPurple)
                }
        }
    }

    // MARK: - Target Header Card

    private var targetHeaderCard: some View {
        CardView {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("CURRENT TARGET")
                        .capsStyle()

                    Text(vm.roadmap?.targetRole ?? "Marketing Analyst")
                        .font(AppTypography.title1)
                        .fontWeight(.bold)
                        .foregroundStyle(AppColors.primaryPurple)

                    HStack(spacing: 8) {
                        timelineChip
                        trackChip
                    }
                }

                Spacer()

                CircularProgressView(
                    progress: vm.completionFraction,
                    size: 60,
                    lineWidth: 6
                )
            }

            HStack(spacing: 10) {
                Button {
                    vm.showAdjustTimeline = true
                } label: {
                    Label("Adjust Timeline", systemImage: "pencil")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(AppColors.primaryPurple, in: Capsule())
                }

                Button {} label: {
                    Label("Add Custom Task", systemImage: "plus")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(AppColors.darkText)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            Capsule().stroke(AppColors.lightGrayBorder, lineWidth: 1.5)
                        )
                }
            }
        }
    }

    private var timelineChip: some View {
        HStack(spacing: 4) {
            Image(systemName: "calendar")
                .font(.system(size: 11))
            Text("6 Months Timeline")
                .font(.system(size: 12, weight: .medium))
        }
        .foregroundStyle(AppColors.grayText)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(AppColors.inputBg, in: Capsule())
    }

    private var trackChip: some View {
        HStack(spacing: 4) {
            Image(systemName: "brain")
                .font(.system(size: 11))
            Text("Advanced Track")
                .font(.system(size: 12, weight: .medium))
        }
        .foregroundStyle(AppColors.tealAccent)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(AppColors.tealAccent.opacity(0.1), in: Capsule())
    }

    // MARK: - Skill Gap Card

    private var skillGapCard: some View {
        CardView {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                        .foregroundStyle(AppColors.primaryPurple)
                    Text("Skill Gap Indicator")
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                }
                Spacer()
                Text("\(vm.skillGaps.count) MISSING SKILLS IDENTIFIED")
                    .capsStyle(size: 9, color: AppColors.grayText)
            }

            if vm.skillGaps.isEmpty {
                let gaps = placeholderGaps
                ForEach(gaps, id: \.name) { gap in
                    skillGapRow(name: gap.name, subtitle: gap.subtitle, icon: gap.icon)
                }
            } else {
                ForEach(vm.skillGaps) { gap in
                    skillGapRow(
                        name: gap.skill,
                        subtitle: gap.learningResource,
                        icon: "doc.text.fill"
                    )
                }
            }
        }
    }

    private func skillGapRow(name: String, subtitle: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Circle()
                .fill(AppColors.lightPurpleTint)
                .frame(width: 36, height: 36)
                .overlay {
                    Image(systemName: icon)
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.primaryPurple)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(AppTypography.callout)
                    .fontWeight(.semibold)
                    .foregroundStyle(AppColors.darkText)
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.grayText)
                    .lineLimit(2)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.grayText)
        }
        .padding(12)
        .background(AppColors.lavenderBg, in: RoundedRectangle(cornerRadius: 12))
    }

    private var placeholderGaps: [(name: String, subtitle: String, icon: String)] {
        [
            ("Google Data Analytics Certificate", "Recommended for core technical foundation", "g.circle.fill"),
            ("Meta Marketing Analytics Certificate", "Advanced tracking and attribution mastery", "m.circle.fill")
        ]
    }

    // MARK: - Learning Path

    private var learningPathSection: some View {
        VStack(spacing: 16) {
            sectionHeader(icon: "graduationcap.fill", title: "COURSES")
            taskList(items: vm.courseTasks.isEmpty ? placeholderCourses : vm.courseTasks, category: .course)

            sectionHeader(icon: "rocket.fill", title: "PROJECTS")
            taskList(items: vm.projectTasks.isEmpty ? placeholderProjects : vm.projectTasks, category: .project)

            sectionHeader(icon: "person.2.fill", title: "NETWORKING")
            taskList(items: vm.networkingTasks.isEmpty ? placeholderNetworking : vm.networkingTasks, category: .networking)

            // New Networking Task button
            Button {} label: {
                HStack(spacing: 6) {
                    Image(systemName: "plus.circle.fill")
                    Text("+ New Networking Task")
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundStyle(AppColors.grayText)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private func sectionHeader(icon: String, title: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.primaryPurple)
            Text(title)
                .capsStyle(size: 12, color: AppColors.darkText)
            Spacer()
        }
    }

    private enum TaskCategory { case course, project, networking }

    private func taskList(items: [TaskItem], category: TaskCategory) -> some View {
        VStack(spacing: 10) {
            ForEach(items) { task in
                taskRow(task: task, category: category)
            }
        }
    }

    private func taskRow(task: TaskItem, category: TaskCategory) -> some View {
        Button {
            switch category {
            case .course:      selectedCourse = task
            case .project:     selectedProject = task
            case .networking:  selectedNetworking = task
            }
        } label: {
            HStack(spacing: 0) {
                // Colored left border
                RoundedRectangle(cornerRadius: 2)
                    .fill(borderColor(for: task.priority))
                    .frame(width: 4)

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(task.title)
                            .font(AppTypography.callout)
                            .fontWeight(.semibold)
                            .foregroundStyle(AppColors.darkText)
                            .multilineTextAlignment(.leading)
                        Spacer()
                        BadgeView(text: task.priority, style: badgeStyle(for: task.priority))
                    }

                    if let desc = task.description, !desc.isEmpty {
                        Text(desc)
                            .font(.system(size: 12))
                            .foregroundStyle(AppColors.grayText)
                            .lineLimit(2)
                            .multilineTextAlignment(.leading)
                    }
                }
                .padding(14)

                Image(systemName: "ellipsis")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.grayText)
                    .padding(.trailing, 14)
            }
            .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
            .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }

    private func borderColor(for priority: String) -> Color {
        switch priority.lowercased() {
        case "high":   return AppColors.highPriorityRed
        case "medium": return AppColors.warningAmber
        case "low":    return AppColors.lowPriorityTeal
        default:       return AppColors.grayText
        }
    }

    private func badgeStyle(for priority: String) -> BadgeStyle {
        switch priority.lowercased() {
        case "high":   return .highPriority
        case "medium": return .mediumPriority
        case "low":    return .lowPriority
        default:       return .lowPriority
        }
    }

    // MARK: - Placeholder data (shown when API returns empty)

    private var placeholderCourses: [TaskItem] {
        [
            TaskItem(id: "c1", userId: userId, milestoneId: nil,
                     title: "Learn SQL Basics", description: "4 of 12 modules completed",
                     status: "in_progress", priority: "High", category: "course",
                     dueDate: nil, completedAt: nil, createdAt: "", aiGenerated: true),
            TaskItem(id: "c2", userId: userId, milestoneId: nil,
                     title: "Marketing Analytics Fundamentals", description: "Course by Google Analytics Academy",
                     status: "pending", priority: "Medium", category: "course",
                     dueDate: nil, completedAt: nil, createdAt: "", aiGenerated: true)
        ]
    }

    private var placeholderProjects: [TaskItem] {
        [
            TaskItem(id: "p1", userId: userId, milestoneId: nil,
                     title: "Portfolio Audit", description: "Review and update your portfolio for target role alignment.",
                     status: "pending", priority: "Low", category: "project",
                     dueDate: nil, completedAt: nil, createdAt: "", aiGenerated: true),
            TaskItem(id: "p2", userId: userId, milestoneId: nil,
                     title: "E-commerce Data Project", description: "End-to-end analytics project using real datasets.",
                     status: "pending", priority: "High", category: "project",
                     dueDate: nil, completedAt: nil, createdAt: "", aiGenerated: true)
        ]
    }

    private var placeholderNetworking: [TaskItem] {
        [
            TaskItem(id: "n1", userId: userId, milestoneId: nil,
                     title: "Industry Coffee Chat", description: "Connect with 3 professionals in your target field.",
                     status: "pending", priority: "Medium", category: "networking",
                     dueDate: nil, completedAt: nil, createdAt: "", aiGenerated: true)
        ]
    }

    private var userId: String { vm.userId }
}
