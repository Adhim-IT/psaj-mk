import Footer from "@/components/user/Footer";
import Navbar from "@/components/user/Navbar";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Navbar />
          {children}
          <Footer/>
        </div>
    );
};

export default UserLayout;
