import add_icon from "./add_icon.png";
import bath_icon from "./bath_icon.png";
import bed_icon from "./bed_icon.png";
import calendar_icon from "./calendar_icon.png";
import camera_icon from "./camera_icon.png";
import dashboard_icon from "./dashboard_icon.png";
import delete_icon from "./delete_icon.png";
import dining_icon from "./dining_icon.png";
import edit_icon from "./edit_icon.png";
import freezer_icon from "./freezer_icon.png";
import hero_img from "./hero_img.png";
import img1 from "./img1.png";
import img2 from "./img2.png";
import img3 from "./img3.png";
import location_icon from "./location_icon.png";
import location from "./location.png";
import meter_icon from "./meter_icon.png";
import offer_img1 from "./offer_img1.png";
import offer_img2 from "./offer_img2.png";
import offer_img3 from "./offer_img3.png";
import offer_img4 from "./offer_img4.png";
import offer_img5 from "./offer_img5.png";
import profile_icon from "./profile_icon.png";
import room_icon from "./room_icon.png";
import tv_icon from "./tv_icon.png";
import user_icon from "./user_icon.png";
import users_icon from "./users_icon.png";
import wifi_icon from "./wifi_icon.png";

export const assets = {
  hero_img,
  user_icon,
  location,
  calendar_icon,
  profile_icon,
  add_icon,
  delete_icon,
  edit_icon,
  freezer_icon,
  dashboard_icon,
};

export const cities = [
  "Mumbai",
  "Goa",
  "Delhi",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Lahore",
  "Karachi",
  "Murree",
  "Nashik",
  "Pune",
  "Islamabad",
];

export const homePageData = [
  {
    icon: users_icon,
    title: "users",
    value: "2500",
  },
  {
    icon: camera_icon,
    title: "treasures",
    value: "400",
  },
  {
    icon: location_icon,
    title: "cities",
    value: "200",
  },
];

export const villasData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
    name: "Grand Palace Villa",
    address: "123 Royal Street, Manhattan, New York, NY 10001",
    rating: 4.8,
    price: "$299",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    ownerName: "Robert Wilson",
    contactNumber: "+1 (555) 123-4567",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop",
    name: "Ocean View Villa",
    address: "456 Beachfront Ave, Miami Beach, FL 33139",
    rating: 4.6,
    price: "$199",
    amenities: ["WiFi", "Beach Access", "Pool", "Bar"],
    ownerName: "Maria Rodriguez",
    contactNumber: "+1 (555) 987-6543",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop",
    name: "Sunset Paradise Villa",
    address: "Hilltop Road, Malibu, California",
    rating: 4.9,
    price: "$350",
    amenities: ["WiFi", "Infinity Pool", "Gym", "Private Chef"],
    ownerName: "David Anderson",
    contactNumber: "+1 (555) 678-4561",
  },
];

export const roomsData = [
  {
    _id: "67f7647c197ac559e4089b96",
    villa: villasData[0],
    roomType: "Deluxe Suite",
    pricePerNight: 450,
    description: "Experience luxury at its finest in our Deluxe Suite...",
    amenities: ["Ocean View", "Balcony", "Mini Bar", "Room Service"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
  },

  {
    _id: "67f76452197ac559e4089b8e",
    villa: villasData[1],
    roomType: "Executive Room",
    pricePerNight: 350,
    description: "Perfect for business travelers...",
    amenities: ["City View", "Work Desk", "Premium WiFi", "Concierge Service"],
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
  },

  {
    _id: "67f76452197ac559e4089bAA",
    villa: villasData[2],
    roomType: "Royal Premium Suite",
    pricePerNight: 550,
    description: "A luxurious suite with panoramic hilltop views...",
    amenities: ["Infinity Pool Access", "Private Terrace", "Butler Service"],
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1586105446749-9d816f9a993c?w=400&h=300&fit=crop",
    ],
    isAvailable: false,
  },
];

export const bookingData = [
  {
    _id: "67f76839994a731e97d3b8ce",
    room: roomsData[1],
    villa: villasData[1],
    checkInDate: "2025-04-30T00:00:00.000Z",
    checkOutDate: "2025-05-01T00:00:00.000Z",
    totalPrice: 350,
    guests: 2,
    status: "confirmed",
    paymentMethod: "Stripe",
    isPaid: true,
  },

  {
    _id: "67f76829994a731e97d3b8c3",
    room: roomsData[0],
    villa: villasData[0],
    checkInDate: "2025-04-27T00:00:00.000Z",
    checkOutDate: "2025-04-28T00:00:00.000Z",
    totalPrice: 450,
    guests: 1,
    status: "pending",
    paymentMethod: "Pay At Villa",
    isPaid: false,
  },

  {
    _id: "67f76810994a731e97d3b8b4",
    room: roomsData[2],   // now valid
    villa: villasData[2], // now valid
    checkInDate: "2025-04-11T00:00:00.000Z",
    checkOutDate: "2025-04-12T00:00:00.000Z",
    totalPrice: 550,
    guests: 1,
    status: "cancelled",
    paymentMethod: "Pay At Villa",
    isPaid: false,
  },
];
