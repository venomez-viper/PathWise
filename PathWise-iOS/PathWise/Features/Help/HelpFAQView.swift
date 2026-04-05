import SwiftUI

struct HelpFAQView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""

    // MARK: - FAQ Data

    fileprivate struct FAQItem: Identifiable {
        let id = UUID()
        let question: String
        let answer: String
    }

    fileprivate struct FAQSection: Identifiable {
        let id = UUID()
        let title: String
        let items: [FAQItem]
    }

    private let sections: [FAQSection] = [
        FAQSection(title: "GETTING STARTED", items: [
            FAQItem(
                question: "How do I create my first Career Roadmap?",
                answer: "After completing your skills assessment, PathWise automatically generates a personalised Career Roadmap for you. Navigate to the Roadmap tab from the home screen to view your tailored learning path and milestones."
            ),
            FAQItem(
                question: "Synchronizing your LinkedIn profile",
                answer: "Go to Edit Profile and tap 'Connect LinkedIn'. You'll be redirected to LinkedIn to authorise the connection. PathWise will import your work history and skills to refine your career matches."
            )
        ]),
        FAQSection(title: "ROADMAP & TASKS", items: [
            FAQItem(
                question: "Can I customize my skill milestones?",
                answer: "Yes! Every PathWise roadmap is fully editable. Simply click the 'Edit' icon on any milestone to adjust the target date, add specific sub-tasks, or link personal portfolio projects."
            ),
            FAQItem(
                question: "Tracking daily task streaks",
                answer: "Your streak counter increments every day you complete at least one task. Visit the Streaks screen to see your current streak, best streak, and weekly progress breakdown."
            )
        ]),
        FAQSection(title: "BILLING", items: [
            FAQItem(
                question: "Changing your subscription plan",
                answer: "Go to Settings > Premium Plan and tap 'Upgrade Plan'. You can switch between Monthly and Annual billing, or downgrade to Free at any time. Changes take effect at the next billing cycle."
            ),
            FAQItem(
                question: "Refund policy for PathWise Premium",
                answer: "We offer a 7-day money-back guarantee for new Premium subscribers. Contact our support team within 7 days of your purchase and we'll process a full refund — no questions asked."
            )
        ])
    ]

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.sectionSpacing) {
                headingSection
                searchBar
                filteredSections
                supportCard
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 16)
        }
        .background(Color.white)
        .navigationTitle("Help & FAQ")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.darkText)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Circle()
                    .fill(AppColors.lightPurpleTint)
                    .frame(width: 32, height: 32)
                    .overlay {
                        Image(systemName: "person.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.primaryPurple)
                    }
            }
        }
    }

    // MARK: - Heading

    private var headingSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("How can we help?")
                .font(AppTypography.title1)
                .foregroundStyle(AppColors.darkText)
            Text("Search for articles or browse categories below.")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(AppColors.grayText)
                .font(.system(size: 16))
            TextField("Search for 'Career Roadmaps'...", text: $searchText)
                .font(AppTypography.body)
                .foregroundStyle(AppColors.darkText)
            if !searchText.isEmpty {
                Button { searchText = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(AppColors.grayText)
                }
            }
        }
        .padding(.horizontal, 16)
        .frame(height: AppTheme.inputHeight)
        .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
    }

    // MARK: - FAQ Sections (filtered)

    @ViewBuilder
    private var filteredSections: some View {
        ForEach(filteredFAQSections) { section in
            faqSection(section)
        }
    }

    private var filteredFAQSections: [FAQSection] {
        if searchText.isEmpty { return sections }
        return sections.compactMap { section in
            let filtered = section.items.filter {
                $0.question.localizedCaseInsensitiveContains(searchText) ||
                $0.answer.localizedCaseInsensitiveContains(searchText)
            }
            guard !filtered.isEmpty else { return nil }
            return FAQSection(title: section.title, items: filtered)
        }
    }

    private func faqSection(_ section: FAQSection) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(section.title)
                .capsStyle(size: 11, color: AppColors.primaryPurple)

            VStack(spacing: 8) {
                ForEach(section.items) { item in
                    AccordionItem(item: item)
                }
            }
        }
    }

    // MARK: - Support Card

    private var supportCard: some View {
        VStack(spacing: 14) {
            Image(systemName: "questionmark.circle.fill")
                .font(.system(size: 32))
                .foregroundStyle(AppColors.primaryPurple)

            VStack(spacing: 6) {
                Text("Still have questions?")
                    .font(AppTypography.headline)
                    .foregroundStyle(AppColors.darkText)
                Text("Our dedicated PathFinder support team is ready to help you navigate your journey.")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
                    .multilineTextAlignment(.center)
            }

            Button {} label: {
                Text("Contact Support")
                    .font(AppTypography.button)
                    .foregroundStyle(AppColors.primaryPurple)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Capsule().stroke(AppColors.primaryPurple, lineWidth: 1.5))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.cardPadding)
        .background(AppColors.lightPurpleTint, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .padding(.bottom, 16)
    }
}

// MARK: - Accordion Item

private struct AccordionItem: View {
    let item: HelpFAQView.FAQItem
    @State private var isExpanded = false

    var body: some View {
        DisclosureGroup(isExpanded: $isExpanded) {
            VStack(alignment: .leading, spacing: 10) {
                Text(item.answer)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
                    .fixedSize(horizontal: false, vertical: true)
                Button {} label: {
                    HStack(spacing: 4) {
                        Text("Read more")
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.primaryPurple)
                        Image(systemName: "arrow.right")
                            .font(.system(size: 12))
                            .foregroundStyle(AppColors.primaryPurple)
                    }
                }
            }
            .padding(.top, 8)
        } label: {
            Text(item.question)
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.darkText)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .tint(AppColors.primaryPurple)
        .padding(AppTheme.cardPadding)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
        .animation(.easeInOut(duration: 0.2), value: isExpanded)
    }
}
