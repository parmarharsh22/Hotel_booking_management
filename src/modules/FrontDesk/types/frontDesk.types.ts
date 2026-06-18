export type Shift = "Morning" | "Evening" | "Night";

export type VerificationStatus = "APPROVED" | "FAILED";

export type BookingStatusId = 1 | 2 | 3 | 4 | 5;

export interface FrontDeskUserRow {
    name: string; // hotels.name
    first_name: string;
    last_name: string;
    photo_url: string | null;
}

export interface CheckinCountRow {
    totalCheckins: number;
}

export interface CheckoutCountRow {
    totalCheckouts: number;
}

export interface OccupancyRow {
    occupancy: number | null;
}

export interface ArrivalRow {
    booking_id: number;
    booking_reference: string;
    user_id: number;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    checkin_date: Date | string;
    total_rooms: number;
    room_numbers: string; // group_concat result
    room_statuses: string; // group_concat result
}

export interface allCounts {
    maintenance: number;
    occupied: number;
    vacant: number;
}

export interface DashboardData {
    userData: FrontDeskUserRow;
    checkins: number;
    checkouts: number;
    occupancy: number;
    arrivals: ArrivalRow[];
    counts: DashboardCounts;
    floorOccupancy: FloorOccupancyRow[];
    roomTypeStats: RoomTypeUtilizationRow[];
    arrivalForecast: ArrivalForecastRow[];
}

export interface BookingDetailRow {
    booking_id: number;
    booking_reference: string;
    checkin_date: Date | string;
    checkout_date: Date | string;
    adults: number;
    children: number;
    total_amount: number;
    special_requests: string | null;

    // booking_rooms
    booking_room_id: number;
    rate_per_night: number;

    // rooms
    room_id: number;
    room_number: string;
    floor: number | null;

    // room_types
    room_type_id: number;
    type_name: string;
    base_price: number;
    capacity: number; // max_adults + max_children
    photo_url: string | null; // room_type photo
    description: string | null;

    // users (guest)
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    dob: Date | string | null;
    gender: "Male" | "Female" | "Other" | "Prefer Not To Say" | null;
    address: string | null;
    city: string;
    state: string;
}

export interface VerificationPageRow {
    booking_id: number;
    booking_reference: string;
    user_id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
}

export interface StoreDocBody {
    booking_id: string;
    user_id: string;
    id_type_id: string;
    id_number: string;
    verification_status: VerificationStatus;
    remarks: string;
}

export interface DashboardUpdatePayload {
    bookingId: string | number;
    status: VerificationStatus;
}

export interface HomeLocals {
    hotelId: number;
    hotelname: string;
    first_name: string;
    last_name: string;
    photo: string | null;
    checkincount: number;
    checkoutcount: number;
    occupancy: number;
    arrivals: ArrivalRow[];
    error: string | undefined;
    shift: Shift;
}

export interface BookingDetailsLocals {
    booking: BookingDetailRow;
    user_id: number;
}

export interface CaptureGuestLocals {
    booking: VerificationPageRow;
}

export interface RoomInventoryRow {
    room_number: string;
    capacity: number;
    floor: number;
    type_name: string;
    room_status: "OCCUPIED" | "VACANT" | "MAINTENANCE";
    current_guest: string | null;
    booking_reference: string | null;
    checkout_date: Date | string | null;
}

export interface DashboardCounts {
    occupied: number;
    vacant: number;
    maintenance: number;
}

export interface FloorOccupancyRow {
    floor: number;
    occupied: number;
}

export interface RoomTypeUtilizationRow {
    type_name: string;
    occupied: number;
}

export interface ArrivalForecastRow {
    arrival_date: string;
    total: number;
}

export interface BookingFilters {
    hotelId: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit: number;
    offset: number;
}

export interface getAllCheckInGuest {
    booking_id: number;
    booking_reference: string;
    first_name: string;
    last_name: string;
    total_rooms: number;
    checkin_date: Date | string;
    checkout_date: Date | string;
}

// shape of a room row returned after checkout (used for redis dirty tracking)
export interface CheckedOutRoom {
    room_id: number;
    room_number: string;
}
