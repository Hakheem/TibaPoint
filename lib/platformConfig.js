/**
 * Platform Configuration
 * Centralized configuration for platform-wide settings
 */

export const platformConfig = {
  // Commission and Earnings
  platformCommission: 0.18, // 18% - Platform commission percentage (doctors get 82%)

  // Can be overridden per transaction if needed
  // Use this as the default across the platform

  /**
   * Calculate doctor and platform earnings
   * @param {number} totalPrice - Total consultation price
   * @param {number} customCommission - Optional custom commission (defaults to platformCommission)
   * @returns {Object} - { doctorEarnings, platformEarnings }
   */
  calculateEarnings: function (totalPrice, customCommission = null) {
    const commission = customCommission ?? this.platformCommission;
    const platformEarnings = totalPrice * commission;
    const doctorEarnings = totalPrice * (1 - commission);

    return {
      platformEarnings: Math.round(platformEarnings * 100) / 100,
      doctorEarnings: Math.round(doctorEarnings * 100) / 100,
      commission: commission,
    };
  },

  /**
   * Get commission percentage for display
   * @returns {number} - Percentage (e.g., 18 for 18%)
   */
  getCommissionPercentage: function () {
    return Math.round(this.platformCommission * 100);
  },

  /**
   * Get doctor payout percentage
   * @returns {number} - Percentage (e.g., 82 for 82%)
   */
  getDoctorPayoutPercentage: function () {
    return 100 - this.getCommissionPercentage();
  },
};

export default platformConfig;
