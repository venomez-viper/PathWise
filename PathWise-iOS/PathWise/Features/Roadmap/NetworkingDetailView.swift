import SwiftUI

struct NetworkingDetailView: View {
    let task: TaskItem

    @State private var contacts: [NetworkingContact] = [
        NetworkingContact(), NetworkingContact(), NetworkingContact()
    ]
    @State private var completedCount = 0

    private let proTips: [String] = [
        "Personalize your message with a specific detail from their LinkedIn.",
        "Follow up within 48 hours of any interaction.",
        "Offer value first — share a relevant article or insight."
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            AppColors.offWhiteBg.ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.sectionSpacing) {
                    headerSection
                    contactTracker
                    conversationStarterCard
                    proTipsCard
                    progressSection
                }
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.bottom, AppTheme.tabBarHeight + 24)
            }
        }
        .navigationTitle(task.title)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("CAREER ROADMAP - PHASE 5.6")
                .capsStyle()

            Text(task.title)
                .font(AppTypography.title2)
                .fontWeight(.bold)
                .foregroundStyle(AppColors.darkText)

            if let desc = task.description, !desc.isEmpty {
                Text(desc)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Contact Tracker

    private var contactTracker: some View {
        CardView {
            HStack {
                Text("Contact Tracker")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Spacer()
                BadgeView(
                    text: "\(completedCount)/3 COMPLETED",
                    style: .custom(AppColors.successGreen.opacity(0.12), AppColors.successGreen)
                )
            }

            VStack(spacing: 0) {
                ForEach(contacts.indices, id: \.self) { i in
                    contactEntryForm(index: i)
                    if i < contacts.count - 1 {
                        Divider().padding(.vertical, 12)
                    }
                }
            }
        }
    }

    private func contactEntryForm(index: Int) -> some View {
        let isFirst = index == 0
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                if isFirst {
                    Rectangle()
                        .fill(AppColors.primaryPurple)
                        .frame(width: 3, height: 16)
                        .clipShape(Capsule())
                }
                Text("Contact \(index + 1)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(AppColors.grayText)
                    .capsStyle(size: 11, color: AppColors.grayText)
            }

            networkingInputField(
                label: "FULL NAME",
                placeholder: "e.g. Sarah Jenkins",
                text: Binding(
                    get: { contacts[index].name },
                    set: { contacts[index].name = $0 }
                )
            )

            networkingInputField(
                label: "COMPANY",
                placeholder: "e.g. Goldman Sachs",
                text: Binding(
                    get: { contacts[index].company },
                    set: { contacts[index].company = $0 }
                )
            )

            // Status picker
            VStack(alignment: .leading, spacing: 4) {
                Text("STATUS")
                    .capsStyle(size: 10, color: AppColors.grayText)

                Menu {
                    ForEach(ContactStatus.allCases, id: \.self) { status in
                        Button(status.rawValue) {
                            contacts[index].status = status
                            updateCompletedCount()
                        }
                    }
                } label: {
                    HStack {
                        Text(contacts[index].status.rawValue)
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.primaryPurple)
                        Spacer()
                        Image(systemName: "chevron.down")
                            .font(.system(size: 12))
                            .foregroundStyle(AppColors.grayText)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
                }
            }

            // Date picker
            VStack(alignment: .leading, spacing: 4) {
                Text("DATE")
                    .capsStyle(size: 10, color: AppColors.grayText)

                HStack {
                    DatePicker(
                        "",
                        selection: Binding(
                            get: { contacts[index].date ?? Date() },
                            set: { contacts[index].date = $0 }
                        ),
                        displayedComponents: .date
                    )
                    .labelsHidden()
                    Spacer()
                    Image(systemName: "calendar")
                        .foregroundStyle(AppColors.grayText)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
            }
        }
    }

    private func networkingInputField(label: String, placeholder: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .capsStyle(size: 10, color: AppColors.grayText)

            TextField(placeholder, text: text)
                .font(AppTypography.callout)
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
        }
    }

    // MARK: - Conversation Starter

    private var conversationStarterCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Need a conversation starter?")
                .font(AppTypography.headline)
                .foregroundStyle(.white)

            Text("Use our proven Outreach Template.")
                .font(AppTypography.callout)
                .foregroundStyle(.white.opacity(0.9))

            Button {} label: {
                Text("Copy Message Template")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        Capsule().stroke(.white.opacity(0.7), lineWidth: 1.5)
                    )
            }
        }
        .padding(AppTheme.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [AppColors.tealAccent, Color(hex: "0F9E8E")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: AppTheme.cardRadius)
        )
    }

    // MARK: - Pro Tips

    private var proTipsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "lightbulb.fill")
                    .foregroundStyle(AppColors.amberGold)
                Text("Pro Tips")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
            }

            VStack(alignment: .leading, spacing: 10) {
                ForEach(proTips.indices, id: \.self) { i in
                    HStack(alignment: .top, spacing: 10) {
                        Text(String(format: "%02d", i + 1))
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(AppColors.amberGold)
                            .frame(width: 24)
                        Text(proTips[i])
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.darkText)
                            .multilineTextAlignment(.leading)
                    }
                }
            }
        }
        .padding(AppTheme.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppColors.amberGold.opacity(0.1), in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
    }

    // MARK: - Progress Section

    private var progressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            ProgressBarView(progress: 14.0 / 24.0)
                .frame(height: 8)

            Text("You've completed **14/24 tasks** in this career path. Keep the momentum!")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)

            OutlinedButton(title: "View Full Roadmap") {}
        }
        .padding(AppTheme.cardPadding)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }

    // MARK: - Helpers

    private func updateCompletedCount() {
        completedCount = contacts.filter { $0.status == .contacted || $0.status == .responded }.count
    }
}

// MARK: - Supporting Models

struct NetworkingContact {
    var name: String = ""
    var company: String = ""
    var status: ContactStatus = .toContact
    var date: Date? = nil
}

enum ContactStatus: String, CaseIterable {
    case toContact   = "To Contact"
    case contacted   = "Contacted"
    case responded   = "Responded"
    case meeting     = "Meeting Scheduled"
    case completed   = "Completed"
}
