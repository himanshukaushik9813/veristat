// Veristat web UI kit — router shell wiring the screens together.
const { useState, useCallback } = React;

function App() {
  const [route, setRoute] = useState("landing");
  const [serviceId, setServiceId] = useState(1);
  const go = useCallback((r, id) => {
    if (id != null) setServiceId(id);
    setRoute(r);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <>
      <window.VS_NavBar route={route} go={go} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 32px 64px" }}>
        {route === "landing" && <window.VS_Landing go={go} />}
        {route === "leaderboard" && <window.VS_Leaderboard go={go} />}
        {route === "service" && <window.VS_Scorecard id={serviceId} go={go} />}
        {(route === "docs" || route === "report") && <window.VS_Docs go={go} />}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
