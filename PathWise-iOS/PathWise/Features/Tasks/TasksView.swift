import SwiftUI

struct TasksView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: TasksViewModel?

    var body: some View {
        Group {
            if let vm = viewModel {
                if vm.isLoading {
                    LoadingView()
                } else if vm.tasks.isEmpty {
                    tasksEmptyState
                } else {
                    tasksContent(vm)
                }
            } else {
                LoadingView()
            }
        }
        .background(AppColors.offWhiteBg)
        .navigationTitle("")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                HStack(spacing: 6) {
                    Image(systemName: "book.fill").foregroundStyle(AppColors.primaryPurple)
                    Text("PathWise").font(.system(size: 18, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
        .task {
            if let user = authManager.currentUser {
                let vm = TasksViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
        .sheet(isPresented: Binding(get: { viewModel?.showCelebration ?? false }, set: { viewModel?.showCelebration = $0 })) {
            TaskCelebrationView(userName: authManager.currentUser?.name.components(separatedBy: " ").first ?? "")
        }
    }

    private func tasksContent(_ vm: TasksViewModel) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Stay on track with today's priorities")
                    .font(AppTypography.title2).foregroundStyle(AppColors.darkText)
                    .frame(maxWidth: .infinity, alignment: .leading)

                // Target info bar
                HStack {
                    HStack(spacing: 4) {
                        Text("TARGETING").capsStyle(size: 9)
                        Text(vm.targetRole).font(.system(size: 12, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                    }
                    Spacer()
                    HStack(spacing: 4) {
                        Text("PROGRESS").capsStyle(size: 9)
                        Text("\(vm.progressPercent)%").font(.system(size: 12, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                    }
                }
                .padding(12)
                .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: 12))

                ProgressBarView(progress: Double(vm.progressPercent) / 100.0)

                // Daily/Weekly toggle
                HStack(spacing: 0) {
                    toggleButton("Daily", isSelected: vm.isDailyView) { vm.isDailyView = true }
                    toggleButton("Weekly", isSelected: !vm.isDailyView) { vm.isDailyView = false }
                }
                .background(AppColors.inputBg, in: Capsule())

                // Task list
                VStack(spacing: 12) {
                    ForEach(vm.filteredTasks) { task in
                        taskRow(task, vm: vm)
                    }
                }

                PillButton(title: "COMPLETE TASKS", icon: "sparkles") {}
                    .padding(.top, 8)

                Text("ESTIMATED TIME: 45 MINUTES").capsStyle(size: 10)
            }
            .padding(AppTheme.screenPadding)
        }
    }

    private func toggleButton(_ title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: isSelected ? .bold : .regular))
                .foregroundStyle(isSelected ? AppColors.darkText : AppColors.grayText)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(isSelected ? .white : .clear, in: Capsule())
                .shadow(color: isSelected ? .black.opacity(0.06) : .clear, radius: 2)
        }
    }

    private func taskRow(_ task: TaskItem, vm: TasksViewModel) -> some View {
        CardView {
            HStack(spacing: 14) {
                Button {
                    Task { await vm.updateStatus(taskId: task.id, newStatus: "done") }
                } label: {
                    Circle().stroke(AppColors.lightGrayBorder, lineWidth: 2).frame(width: 24, height: 24)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title).font(AppTypography.headline).foregroundStyle(AppColors.darkText)
                    if let category = task.category {
                        HStack(spacing: 4) {
                            Image(systemName: categoryIcon(category)).font(.system(size: 10))
                            Text(category.capitalized).font(.system(size: 12))
                        }
                        .foregroundStyle(AppColors.grayText)
                    }
                }

                Spacer()
                Image(systemName: "chevron.right").font(.system(size: 12)).foregroundStyle(AppColors.grayText)
            }
        }
    }

    private func categoryIcon(_ category: String) -> String {
        switch category.lowercased() {
        case "learning": return "book"
        case "networking": return "person.2"
        case "portfolio": return "briefcase"
        case "interview_prep": return "mic"
        default: return "clock"
        }
    }

    private var tasksEmptyState: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                RoundedRectangle(cornerRadius: 16).fill(.white).frame(width: 120, height: 100)
                    .shadow(color: .black.opacity(0.06), radius: 8)
                VStack(spacing: 8) {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(AppColors.successGreen)
                        Rectangle().fill(AppColors.lightGrayBorder).frame(width: 60, height: 4).clipShape(Capsule())
                    }
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(AppColors.successGreen)
                        Rectangle().fill(AppColors.lightGrayBorder).frame(width: 40, height: 4).clipShape(Capsule())
                    }
                }
                Image(systemName: "star.fill").font(.system(size: 16)).foregroundStyle(AppColors.tealAccent)
                    .offset(x: 40, y: -30)
            }

            Text("You're all caught up!").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
            Text("No tasks for today. Enjoy the break or explore your roadmap to see what's coming up next in your career journey.")
                .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)

            PillButton(title: "Explore Roadmap") {}.frame(width: 200)
            Button("Add a Custom Task") {}
                .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.primaryPurple)

            Spacer()
        }
    }
}
