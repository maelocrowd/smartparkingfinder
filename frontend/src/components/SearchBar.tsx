import { useMemo, useState } from "react";
import { logActivity } from "../services/activityApi";
import type { ParkingFeature } from "../routes/MapPage";

type Props = {
  userUuid: string | null;
  features: ParkingFeature[];
  onSelectFeature: (feature: ParkingFeature) => void;
};

export const SearchBar = ({ userUuid, features, onSelectFeature }: Props) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return features
      .filter((f) => {
        const props: any = f.properties || {};
        const candidates = [
          props.name,
          props.Name,
          props.NAME,
          props.address,
          props.Address
        ]
          .filter((v: unknown) => typeof v === "string")
          .map((v: string) => v.toLowerCase());
        return candidates.some((text: string) => text.includes(q));
      })
      .slice(0, 5);
  }, [query, features]);

  const selectFeature = (feature: ParkingFeature) => {
    const props: any = feature.properties || {};
    const displayName =
      props.name || props.Name || props.NAME || String(props.id || "");
    setQuery(String(displayName));
    setShowSuggestions(false);

    if (userUuid) {
      logActivity({
        user_uuid: userUuid,
        activity_type: "SEARCH",
        search_query: String(displayName)
      }).catch(() => {});
    }

    onSelectFeature(feature);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      selectFeature(suggestions[0]);
    }
  };

  return (
    <div className="search-wrapper">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Search parking by name or address"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <button type="submit">Search</button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((f) => (
            <li
              key={f.properties.id}
              onMouseDown={(e) => {
                e.preventDefault();
                selectFeature(f);
              }}
            >
              <strong>
                {(f.properties as any).name ||
                  (f.properties as any).Name ||
                  (f.properties as any).NAME}
              </strong>
              <span className="suggestion-address">
                {(f.properties as any).address ||
                  (f.properties as any).Address ||
                  ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

