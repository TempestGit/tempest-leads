const PagePlaceholder = ({
  title,
  description,
}) => {
  return (
    <>
      <div className="tl-title-row">
        <div>
          <h1>
            {title}
          </h1>

          <p>
            {description}
          </p>
        </div>
      </div>

      <section className="tl-card">
        <div className="empty-state">
          <h2>
            {title}
          </h2>

          <p>
            This module will
            be implemented
            using the same
            TEMPEST LEADS UX.
          </p>
        </div>
      </section>
    </>
  );
};

export default PagePlaceholder;