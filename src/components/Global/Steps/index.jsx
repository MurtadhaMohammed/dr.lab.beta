import "./style.css";

const PureSteps = ({ length, activeIndex }) => {
  const arr = [...new Array(length).fill(1)];

  return (
    <div className="pure-steps">
      {arr.map((_, index) => (
        <span key={index} className={index === activeIndex ? "active" : ""}></span>
      ))}
    </div>
  );
};

export default PureSteps;
