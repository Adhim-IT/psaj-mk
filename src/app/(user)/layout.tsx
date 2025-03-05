import Footer from "@/src/components/user/Footer";
import Navbar from "@/src/components/user/Navbar";

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
