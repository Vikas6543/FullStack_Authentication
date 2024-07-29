import Navbar from "@/components/Navbar";

const authLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default authLayout;
