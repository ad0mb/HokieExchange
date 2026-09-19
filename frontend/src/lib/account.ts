export type Review = {
  raterName: string;
  raterInitials: string;
  rating: number;
  comment: string;
};

export type AccountProfile = {
  firstName: string;
  lastName: string;
  email: string;
  avatarInitials: string;
  bio: string;
  buyer: {
    rating: number;
    ratingCount: number;
    itemsBought: number;
    reviews: Review[];
  };
  vendor: {
    rating: number;
    ratingCount: number;
    itemsSold: number;
    reviews: Review[];
    listingIds: string[];
  };
};

export const currentUser: AccountProfile = {
  firstName: "Jordan",
  lastName: "Hokie",
  email: "jordan.hokie@vt.edu",
  avatarInitials: "JH",
  bio: "Senior studying Computer Science at Virginia Tech. I love helping fellow Hokies out with quick services around campus, and I'm always on the lookout for a good deal myself.",
  buyer: {
    rating: 4.7,
    ratingCount: 15,
    itemsBought: 15,
    reviews: [
      { raterName: "Marcus T.", raterInitials: "MT", rating: 2.5, comment: "Paid late, but was communicative about it." },
      { raterName: "Ava R.", raterInitials: "AR", rating: 3.9, comment: "Easy to work with, would sell to again." },
      { raterName: "Priya S.", raterInitials: "PS", rating: 2.7, comment: "A bit slow to respond at first." },
      { raterName: "Sam B.", raterInitials: "SB", rating: 5.0, comment: "Great buyer, paid immediately!" },
      { raterName: "Grace K.", raterInitials: "GK", rating: 2.7, comment: "Showed up late to pickup." },
      { raterName: "Lily N.", raterInitials: "LN", rating: 3.0, comment: "No issues, would work with again." },
    ],
  },
  vendor: {
    rating: 5.0,
    ratingCount: 19,
    itemsSold: 50,
    reviews: [
      { raterName: "Ethan W.", raterInitials: "EW", rating: 4.4, comment: "Good vendor!" },
      { raterName: "Noah F.", raterInitials: "NF", rating: 1.2, comment: "Terrible, would not recommend." },
    ],
    listingIds: ["1", "4"],
  },
};
