import Footer from "@/src/components/user/Footer";
import Navbar from "@/src/components/user/Navbar";

const DashboardUserLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
          <Navbar/>
          {children}
          <Footer/>
        </div>
    );
};

export default DashboardUserLayout;
