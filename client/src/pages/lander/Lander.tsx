import BlurText from "@/components/ui/BlurText";
import StarBorder from "@/components/ui/StarBorder";
import { useNavigate } from "react-router";

const Lander = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen font-dmsans font-bold flex-col ">
      <BlurText
        text="Welcome to DocsDepot"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-7xl mb-8 z-50"
      />
      <div onClick={() => navigate("/auth")}>
        <StarBorder className="text-2xl w-64 z-50">Sign in</StarBorder>
      </div>
    </div>
  );
};

export default Lander;
