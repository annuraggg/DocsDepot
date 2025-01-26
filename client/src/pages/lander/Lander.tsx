import BlurText from "@/components/ui/BlurText";
import StarBorder from "@/components/ui/StarBorder";

const Lander = () => {
  return (
    <div className="flex items-center justify-center h-screen font-dmsans font-bold flex-col ">
     
      <BlurText
        text="Welcome to DocsDepot"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-7xl mb-8 z-50"
      />
      <div onClick={() => window.location.replace("/auth")}>
        <StarBorder className="text-2xl w-64 z-50">Sign in</StarBorder>
      </div>
    </div>
  );
};

export default Lander;
