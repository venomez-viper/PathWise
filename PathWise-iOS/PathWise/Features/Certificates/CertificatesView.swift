import SwiftUI

struct CertificatesView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var viewModel: CertificatesViewModel?
    @State private var showAddSheet = false

    var body: some View {
        Group {
            if let vm = viewModel {
                content(vm)
            } else {
                LoadingView()
            }
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
                Button {
                    showAddSheet = true
                } label: {
                    Image(systemName: "pencil")
                        .foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            if let vm = viewModel {
                AddCertificateSheet(viewModel: vm, isPresented: $showAddSheet)
            }
        }
        .task {
            if let user = authManager.currentUser {
                let vm = CertificatesViewModel(api: authManager.apiClient, userId: user.id)
                viewModel = vm
                await vm.load()
            }
        }
    }

    // MARK: - Content

    @ViewBuilder
    private func content(_ vm: CertificatesViewModel) -> some View {
        if vm.isLoading {
            LoadingView()
        } else {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 6) {
                        Text("My Certificates")
                            .font(AppTypography.title2)
                            .foregroundStyle(AppColors.darkText)
                        Text("Your verified achievements and professional milestones.")
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.grayText)
                    }

                    // Add Certificate CTA
                    PillButton(title: "Add Certificate", icon: "plus.circle.fill", gradient: AppColors.tealPurpleGradient) {
                        showAddSheet = true
                    }

                    // Certificate Cards
                    if vm.certificates.isEmpty {
                        emptyCertificates
                    } else {
                        VStack(spacing: 12) {
                            ForEach(vm.certificates) { cert in
                                CertificateCard(certificate: cert)
                            }
                        }
                    }

                    // Promo Card
                    promoCard
                }
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.vertical, 16)
            }
        }
    }

    // MARK: - Empty State

    private var emptyCertificates: some View {
        VStack(spacing: 12) {
            Image(systemName: "rosette")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.grayText.opacity(0.4))
            Text("No certificates yet")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
            Text("Add your first certificate to showcase your achievements.")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.grayText.opacity(0.7))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
    }

    // MARK: - Promo Card

    private var promoCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Boost your career credibility")
                .font(AppTypography.headline)
                .foregroundStyle(.white)

            Text("Verified certificates increase your profile visibility to top mentors by 45%. Connect your LinkedIn to sync automatically.")
                .font(AppTypography.callout)
                .foregroundStyle(.white.opacity(0.9))

            Button {
                // Connect profiles action
            } label: {
                Text("Connect Profiles")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .overlay(
                        Capsule().stroke(.white.opacity(0.7), lineWidth: 1.5)
                    )
            }
        }
        .padding(AppTheme.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [AppColors.darkPurple, AppColors.primaryPurple],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: AppTheme.cardRadius)
        )
        .shadow(color: AppColors.primaryPurple.opacity(0.35), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Certificate Card

private struct CertificateCard: View {
    let certificate: Certificate

    private var providerInitial: String {
        String(certificate.issuer.prefix(1).uppercased())
    }

    private var initialBgColor: Color {
        let colors: [Color] = [AppColors.primaryPurple, AppColors.tealAccent, Color.orange, Color.blue, Color.green]
        let idx = abs(certificate.issuer.hashValue) % colors.count
        return colors[idx]
    }

    private var issueLabel: String {
        var parts: [String] = []
        if let date = certificate.issuedDate, !date.isEmpty {
            parts.append("Issued \(formattedDate(date))")
        }
        parts.append(certificate.issuer)
        return parts.joined(separator: " · ")
    }

    private func formattedDate(_ raw: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        if let date = formatter.date(from: raw) {
            let out = DateFormatter()
            out.dateFormat = "MMM yyyy"
            return out.string(from: date)
        }
        return raw
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                // Provider initial circle
                Circle()
                    .fill(initialBgColor)
                    .frame(width: 44, height: 44)
                    .overlay {
                        Text(providerInitial)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(.white)
                    }

                VStack(alignment: .leading, spacing: 3) {
                    Text(certificate.name)
                        .font(AppTypography.headline)
                        .foregroundStyle(AppColors.darkText)
                    Text(issueLabel)
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                }

                Spacer()

                if certificate.verified {
                    BadgeView(text: "VERIFIED", style: .verified)
                }
            }

            Divider()

            // Actions row
            HStack(spacing: 16) {
                if let url = certificate.url, !url.isEmpty, let link = URL(string: url) {
                    Link(destination: link) {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.up.right.square")
                                .font(.system(size: 12))
                            Text("View Certificate")
                                .font(.system(size: 13, weight: .medium))
                        }
                        .foregroundStyle(AppColors.primaryPurple)
                    }
                } else {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.up.right.square")
                            .font(.system(size: 12))
                        Text("View Certificate")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundStyle(AppColors.primaryPurple.opacity(0.5))
                }

                Spacer()

                Button {
                    shareCertificate()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 12))
                        Text("Share")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
        .padding(AppTheme.cardPadding)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }

    private func shareCertificate() {
        let text = "Check out my \(certificate.name) certificate from \(certificate.issuer)!"
        let av = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = windowScene.windows.first?.rootViewController {
            root.present(av, animated: true)
        }
    }
}

// MARK: - Add Certificate Sheet

struct AddCertificateSheet: View {
    let viewModel: CertificatesViewModel
    @Binding var isPresented: Bool

    @State private var name = ""
    @State private var issuer = ""
    @State private var issuedDate = ""
    @State private var url = ""

    private var isValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !issuer.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    InputField(label: "Certificate Name", icon: "rosette", placeholder: "e.g. Google Data Analytics", text: $name)
                    InputField(label: "Issuing Organization", icon: "building.2.fill", placeholder: "e.g. Google, Coursera", text: $issuer)
                    InputField(label: "Issue Date (optional)", icon: "calendar", placeholder: "e.g. Oct 2023", text: $issuedDate)
                    InputField(label: "Certificate URL (optional)", icon: "link", placeholder: "https://...", text: $url)
                        .keyboardType(.URL)
                        .autocorrectionDisabled()
                }
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.vertical, 20)
            }
            .background(AppColors.offWhiteBg)
            .navigationTitle("Add Certificate")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { isPresented = false }
                        .foregroundStyle(AppColors.grayText)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        Task {
                            await viewModel.addCertificate(
                                name: name,
                                issuer: issuer,
                                issuedDate: issuedDate.isEmpty ? nil : issuedDate,
                                url: url.isEmpty ? nil : url
                            )
                            isPresented = false
                        }
                    }
                    .foregroundStyle(isValid ? AppColors.primaryPurple : AppColors.grayText)
                    .disabled(!isValid || viewModel.isSaving)
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        CertificatesView()
    }
    .environment(AuthManager())
}
