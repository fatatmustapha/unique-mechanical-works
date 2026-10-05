import BookingForm from "@/components/appointments/BookingForm";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function BookAppointmentPage() {
  return (
    <>
      <Navbar solid />

      <main>
        <BookingForm />
      </main>

      <Footer />
    </>
  );
}