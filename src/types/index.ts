export type UserRole = "GUARDIAN" | "CAREGIVER" | "ADMIN" | "OPERATOR" | "INSTITUTION";
export type Gender = "MALE" | "FEMALE";
export type ServiceCategory =
  | "HOME_CARE"
  | "HOME_BATH"
  | "HOME_NURSING"
  | "DAY_NIGHT_CARE"
  | "SHORT_TERM_CARE"
  | "HOURLY_CARE"
  | "HOSPITAL_CARE"
  | "DEMENTIA_CARE"
  | "HOSPICE_CARE";
export type MatchStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type CareSessionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type NotificationType = "MATCH_REQUEST" | "MATCH_ACCEPTED" | "MATCH_REJECTED" | "CARE_REMINDER" | "REVIEW_RECEIVED" | "SYSTEM";
export type CareLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5" | "COGNITIVE_SUPPORT";
export type CaregiverType = "CARE_WORKER" | "NURSING_AIDE" | "SOCIAL_WORKER" | "NURSE";
export type MobilityLevel = "INDEPENDENT" | "PARTIALLY_DEPENDENT" | "FULLY_DEPENDENT" | "BEDRIDDEN";

export interface CaregiverSearchParams {
  region?: string;
  serviceCategory?: ServiceCategory;
  caregiverType?: CaregiverType;
  careLevel?: CareLevel;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  gender?: Gender;
  specialty?: string;
  sortBy?: "rating" | "rate_low" | "rate_high" | "reviews" | "experience";
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
