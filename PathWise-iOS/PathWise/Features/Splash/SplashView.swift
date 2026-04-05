import SwiftUI

struct SplashView: View {
    @State private var showIcon = false
    @State private var showSparkle = false
    @State private var showText = false
    @State private var showLoading = false

    var body: some View {
        ZStack {
            AppColors.splashGradient.ignoresSafeArea()

            VStack(spacing: 12) {
                Spacer()

                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white.opacity(0.15))
                        .frame(width: 56, height: 56)
                        .overlay {
                            Image(systemName: "book.fill")
                                .font(.system(size: 28))
                                .foregroundStyle(.white)
                        }
                        .scaleEffect(showIcon ? 1 : 0.3)
                        .opacity(showIcon ? 1 : 0)

                    Image(systemName: "sparkle")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.tealLight)
                        .offset(x: 24, y: -20)
                        .scaleEffect(showSparkle ? 1 : 0)
                        .opacity(showSparkle ? 1 : 0)
                }

                Text("PathWise")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(.white)
                    .opacity(showText ? 1 : 0)
                    .offset(y: showText ? 0 : 10)

                Text("Your AI-powered career co-pilot.")
                    .font(.system(size: 16))
                    .foregroundStyle(.white.opacity(0.9))
                    .opacity(showText ? 1 : 0)

                Spacer()

                Text("INITIALIZING INTELLIGENCE")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.5))
                    .opacity(showLoading ? 1 : 0)
                    .padding(.bottom, 40)
            }
        }
        .onAppear { runAnimation() }
    }

    private func runAnimation() {
        withAnimation(.spring(response: 0.6)) { showIcon = true }
        withAnimation(.spring(response: 0.4).delay(0.3)) { showSparkle = true }
        withAnimation(.easeOut(duration: 0.4).delay(0.5)) { showText = true }
        withAnimation(.easeIn(duration: 0.3).delay(0.8)) { showLoading = true }
    }
}
