import SwiftUI

struct EditProfileView: View {
    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss

    @State private var fullName: String = ""
    @State private var email: String = ""
    @State private var currentRole: String = "Senior Product Designer"
    @State private var selectedIndustry: String = "Technology & SaaS"
    @State private var yearsOfExperience: Double = 8
    @State private var bio: String = ""
    @State private var isSaving = false
    @State private var saveError: String?
    @State private var showDeleteConfirm = false

    private let industries = [
        "Technology & SaaS",
        "Finance & Banking",
        "Healthcare",
        "Marketing & Advertising",
        "Education",
        "Consulting",
        "Retail & E-commerce",
        "Media & Entertainment"
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.sectionSpacing) {
                photoSection
                formSection
                saveButton
                dangerZone
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 16)
        }
        .background(Color.white)
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Save") {
                    Task { await save() }
                }
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(AppColors.primaryPurple)
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(AppColors.lightPurpleTint, in: Capsule())
            }
        }
        .onAppear { populateFields() }
        .confirmationDialog("Delete Account", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Delete Account", role: .destructive) {
                // Handle account deletion
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This action permanently removes all your progress, milestones, and career roadmap data. This cannot be undone.")
        }
    }

    // MARK: - Photo Section

    private var photoSection: some View {
        VStack(spacing: 10) {
            ZStack(alignment: .bottomTrailing) {
                Circle()
                    .fill(AppColors.lightPurpleTint)
                    .frame(width: 100, height: 100)
                    .overlay {
                        Text(String(fullName.prefix(1).uppercased()))
                            .font(.system(size: 36, weight: .bold))
                            .foregroundStyle(AppColors.primaryPurple)
                    }
                // Camera overlay
                Circle()
                    .fill(AppColors.primaryPurple)
                    .frame(width: 30, height: 30)
                    .overlay {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(.white)
                    }
                    .offset(x: 4, y: 4)
            }
            Text(fullName.uppercased())
                .capsStyle(size: 10, color: AppColors.grayText)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }

    // MARK: - Form Section

    private var formSection: some View {
        VStack(spacing: 16) {
            // Full Name
            formTextField(label: "FULL NAME", icon: "person.fill", placeholder: "Your full name", text: $fullName)

            // Email
            formTextField(label: "EMAIL ADDRESS", icon: "envelope.fill", placeholder: "your@email.com", text: $email, keyboardType: .emailAddress)

            // Current Role
            formTextField(label: "CURRENT ROLE", icon: "briefcase.fill", placeholder: "e.g. Product Designer", text: $currentRole)

            // Industry Dropdown
            industryPicker

            // Years of Experience
            experienceSlider

            // Professional Bio
            bioTextArea
        }
    }

    private func formTextField(
        label: String,
        icon: String,
        placeholder: String,
        text: Binding<String>,
        keyboardType: UIKeyboardType = .default
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .capsStyle(size: 11, color: AppColors.darkText)
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundStyle(AppColors.grayText)
                    .frame(width: 20)
                TextField(placeholder, text: text)
                    .font(AppTypography.body)
                    .keyboardType(keyboardType)
                    .autocapitalization(keyboardType == .emailAddress ? .none : .words)
            }
            .padding(.horizontal, 16)
            .frame(height: AppTheme.inputHeight)
            .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
        }
    }

    private var industryPicker: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("INDUSTRY")
                .capsStyle(size: 11, color: AppColors.darkText)
            HStack(spacing: 12) {
                Image(systemName: "building.2.fill")
                    .foregroundStyle(AppColors.grayText)
                    .frame(width: 20)
                Picker("Industry", selection: $selectedIndustry) {
                    ForEach(industries, id: \.self) { industry in
                        Text(industry).tag(industry)
                    }
                }
                .pickerStyle(.menu)
                .tint(AppColors.darkText)
                .font(AppTypography.body)
                Spacer()
                Image(systemName: "chevron.down")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.grayText)
            }
            .padding(.horizontal, 16)
            .frame(height: AppTheme.inputHeight)
            .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
        }
    }

    private var experienceSlider: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("YEARS OF EXPERIENCE")
                .capsStyle(size: 11, color: AppColors.darkText)
            HStack(spacing: 14) {
                Slider(value: $yearsOfExperience, in: 0...30, step: 1)
                    .tint(AppColors.primaryPurple)
                Text("\(Int(yearsOfExperience)) Years")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(AppColors.tealAccent)
                    .frame(width: 60, alignment: .trailing)
            }
        }
    }

    private var bioTextArea: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("PROFESSIONAL BIO")
                .capsStyle(size: 11, color: AppColors.darkText)
            HStack(spacing: 0) {
                Rectangle()
                    .fill(AppColors.primaryPurple)
                    .frame(width: 4)
                    .clipShape(RoundedRectangle(cornerRadius: 2))
                TextEditor(text: $bio)
                    .font(AppTypography.body)
                    .foregroundStyle(AppColors.darkText)
                    .frame(minHeight: 100)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
            }
            .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))
        }
    }

    // MARK: - Save Button

    private var saveButton: some View {
        VStack(spacing: 8) {
            if let error = saveError {
                Text(error)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.errorRed)
                    .multilineTextAlignment(.center)
            }
            PillButton(title: "Save Changes", isLoading: isSaving) {
                Task { await save() }
            }
        }
    }

    // MARK: - Danger Zone

    private var dangerZone: some View {
        VStack(alignment: .leading, spacing: 10) {
            Button {
                showDeleteConfirm = true
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: "trash.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.errorRed)
                    Text("Delete Account")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(AppColors.errorRed)
                    Spacer()
                }
            }
            Text("Deleting your account will permanently remove all your progress, milestones, and career roadmap data. This action cannot be undone.")
                .font(AppTypography.caption2)
                .foregroundStyle(AppColors.grayText)
        }
        .padding(AppTheme.cardPadding)
        .background(AppColors.errorRed.opacity(0.05), in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .padding(.bottom, 16)
    }

    // MARK: - Helpers

    private func populateFields() {
        fullName = authManager.currentUser?.name ?? ""
        email = authManager.currentUser?.email ?? ""
        bio = "Passionate product designer with a focus on user-centric solutions and data-driven design decisions. Experienced in leading cross-functional teams to deliver impactful digital products."
    }

    private func save() async {
        isSaving = true
        saveError = nil
        defer { isSaving = false }
        do {
            try await authManager.updateProfile(name: fullName.isEmpty ? nil : fullName, avatarUrl: nil)
            dismiss()
        } catch {
            saveError = error.localizedDescription
        }
    }
}
