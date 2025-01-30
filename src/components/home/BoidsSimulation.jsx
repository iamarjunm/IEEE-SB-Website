import { useEffect, useRef } from "react";

const BoidsSimulation = () => {
  const canvasRef = useRef(null);
  const numBoids = 10;
  const boidSize = 12;
  const boids = [];
  let mouse = { x: null, y: null };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Boid {
      constructor() {
        this.position = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
        };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.acceleration = { x: 0, y: 0 };
        this.maxSpeed = 2;
        this.perceptionRadius = 10;
        this.mouseInfluence = 130;
        this.mouseRepelForce = 1;
      }

      update(boids) {
        this.flock(boids);
        this.avoidMouse();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // Limit speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxSpeed) {
          this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
          this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }

        // Wrap around edges
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.y > canvas.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
      }

      flock(boids) {
        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };
        let separation = { x: 0, y: 0 };
        let total = 0;

        for (let other of boids) {
          let distance = Math.hypot(
            this.position.x - other.position.x,
            this.position.y - other.position.y
          );
          if (other !== this && distance < this.perceptionRadius) {
            alignment.x += other.velocity.x;
            alignment.y += other.velocity.y;
            cohesion.x += other.position.x;
            cohesion.y += other.position.y;
            separation.x += this.position.x - other.position.x;
            separation.y += this.position.y - other.position.y;
            total++;
          }
        }

        if (total > 0) {
          // Alignment
          alignment.x /= total;
          alignment.y /= total;

          // Cohesion
          cohesion.x /= total;
          cohesion.y /= total;
          cohesion.x -= this.position.x;
          cohesion.y -= this.position.y;

          // Separation
          separation.x /= total;
          separation.y /= total;

          // Apply forces
          this.acceleration.x =
            (alignment.x + cohesion.x + separation.x) * 0.02;
          this.acceleration.y =
            (alignment.y + cohesion.y + separation.y) * 0.02;
        }
      }

      avoidMouse() {
        if (mouse.x !== null && mouse.y !== null) {
          let dx = this.position.x - mouse.x;
          let dy = this.position.y - mouse.y;
          let distance = Math.hypot(dx, dy);

          if (distance < this.mouseInfluence) {
            this.acceleration.x += (dx / distance) * this.mouseRepelForce;
            this.acceleration.y += (dy / distance) * this.mouseRepelForce;
          }
        }
      }

      draw(ctx) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(boidSize, 0);
        ctx.lineTo(-boidSize, -boidSize / 2);
        ctx.lineTo(-boidSize, boidSize / 2);
        ctx.closePath();
        ctx.fillStyle = "#0072A7";
        ctx.fill();

        ctx.restore();
      }
    }

    for (let i = 0; i < numBoids; i++) {
      boids.push(new Boid());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      boids.forEach((boid) => {
        boid.update(boids);
        boid.draw(ctx);
      });
      requestAnimationFrame(animate);
    }

    function trackMouse(event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }

    window.addEventListener("mousemove", trackMouse);
    animate();

    return () => {
      window.removeEventListener("mousemove", trackMouse);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          background: "#151515",
          display: "block",
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
        pointerEvents="none"
      ></canvas>
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(21, 21, 21, 0.3)", // transparent overlay
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Alegreya SC', serif",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <h1
          className="fontAlSC text-3xl font-semibold transition-transform duration-300 ease-in-out transform hover:scale-105 hover:skew-x-3 hover:-translate-y-1"
          style={{ margin: 0 }}
          onClick={() =>
            document
              .getElementById("about")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          <strong>I</strong>NSTITUTE OF <strong>E</strong>LECTRICAL AND{" "}
          <strong>E</strong>LECTRONICS <strong>E</strong>NGINEERS
        </h1>
        <h2
          className="fontAlSC text-sm transition-transform duration-300 ease-in-out transform hover:scale-105 hover:skew-x-3 hover:-translate-y-1"
          style={{ margin: 0 }}
        >
          STUDENT BRANCH
        </h2>
      </div>
    </div>
  );
};

export default BoidsSimulation;
