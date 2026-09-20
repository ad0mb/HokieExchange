export type Booking = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  bookerName: string;
  bookerInitials: string;
  bookerImage?: string;
};

export type Service = {
  id: string;
  vendorId: number;
  title: string;
  categorySlug: string;
  price: number;
  durationLabel: string;
  sellerName: string;
  sellerInitials: string;
  description: string;
  location: string | null;
  rating: number;
  ratingCount: number;
  imageUrls?: string[];
};
