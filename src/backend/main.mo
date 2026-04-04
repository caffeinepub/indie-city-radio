import BlobMixin "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Prim "mo:prim";

actor {
  // ---- Mixins ----
  include BlobMixin();

  // ---- Types ----

  // V1 Episode: the shape stored in the live canister (no explicit field)
  // Must be declared before stable var that absorbs the old episodes map.
  type EpisodeV1 = {
    id : Nat;
    title : Text;
    description : Text;
    showNotes : Text;
    publishedDate : Text;
    duration : Text;
    audioFileId : Text;
    artworkFileId : Text;
    published : Bool;
    createdAt : Int;
  };

  public type Episode = {
    id : Nat;
    title : Text;
    description : Text;
    showNotes : Text;
    publishedDate : Text;
    duration : Text;
    audioFileId : Text;
    artworkFileId : Text;
    published : Bool;
    explicit : Bool;
    createdAt : Int;
  };

  public type EpisodeInput = {
    title : Text;
    description : Text;
    showNotes : Text;
    publishedDate : Text;
    duration : Text;
    audioFileId : Text;
    artworkFileId : Text;
    published : Bool;
    explicit : Bool;
  };

  public type PodcastInfo = {
    stationName : Text;
    description : Text;
    websiteUrl : Text;
    author : Text;
    language : Text;
    category : Text;
  };

  // ---- Migration: absorb old stable vars from previous version ----
  // Declaring these stable keeps the upgrade checker happy.
  // ADMIN_PRINCIPAL was `stable let` in the old version.
  stable let ADMIN_PRINCIPAL : Principal = Principal.fromText("x3m76-4lxyy-c7idq-woytx-gna5i-5lgxx-log7y-nimmx-d7m6w-slhnq-gqe");
  // _accessControlState was a non-stable `let` in the last deployed version,
  // but may have been stable in an earlier deployed version still on-chain.
  stable let _accessControlState : AccessControl.AccessControlState = AccessControl.initState();

  // ---- Migration: absorb old episodes map (EpisodeV1, no explicit field) ----
  // The live canister stores `episodes` as Map.Map<Nat, EpisodeV1>.
  // Declaring it here with EpisodeV1 satisfies the type-compatibility checker.
  // postupgrade reads from this and migrates into _episodesNew.
  stable let episodes : Map.Map<Nat, EpisodeV1> = Map.empty<Nat, EpisodeV1>();

  // ---- Persistent state (new version) ----
  stable var nextId : Nat = 1;
  stable var podcastInfo : PodcastInfo = {
    stationName = "Indie City Radio";
    description = "Your home for independent music, curated podcasts, and exclusive radio shows from the indie scene.";
    websiteUrl = "https://indiecityradio.com";
    author = "Indie City Radio";
    language = "en-us";
    category = "Music";
  };

  // The live episode map with the new Episode type (includes explicit).
  // Not stable -- serialized via _episodesEntries in pre/postupgrade.
  stable var _episodesEntries : [(Nat, Episode)] = [];
  let _episodes : Map.Map<Nat, Episode> = Map.fromIter<Nat, Episode>(
    _episodesEntries.vals(),
  );

  // ---- Upgrade hooks ----
  system func preupgrade() {
    _episodesEntries := _episodes.entries().toArray();
  };

  system func postupgrade() {
    // Migrate any V1 episodes (no explicit field) from the old stable `episodes` map.
    for ((id, ep) in episodes.entries()) {
      if (_episodes.get(id) == null) {
        let upgraded : Episode = {
          id = ep.id;
          title = ep.title;
          description = ep.description;
          showNotes = ep.showNotes;
          publishedDate = ep.publishedDate;
          duration = ep.duration;
          audioFileId = ep.audioFileId;
          artworkFileId = ep.artworkFileId;
          published = ep.published;
          explicit = false;
          createdAt = ep.createdAt;
        };
        _episodes.add(id, upgraded);
      };
    };
    _episodesEntries := [];
  };

  // ---- Admin principals ----
  let ADMIN_PRINCIPALS : [Principal] = [
    Principal.fromText("x3m76-4lxyy-c7idq-woytx-gna5i-5lgxx-log7y-nimmx-d7m6w-slhnq-gqe"),
    Principal.fromText("qwq4l-mjwka-op3ra-a5i2z-pnhar-7zyoo-jovrh-czfm5-vjrb3-wp22j-tqe"),
  ];

  // ---- Helpers ----
  func isAdmin(caller : Principal) : Bool {
    for (p in ADMIN_PRINCIPALS.vals()) {
      if (caller == p) { return true };
    };
    false;
  };

  func requireAdmin(caller : Principal) {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
  };

  func episodesToArray() : [Episode] {
    _episodes.values().toArray().sort(
      func(a : Episode, b : Episode) : { #less; #equal; #greater } {
        if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal };
      }
    );
  };

  // ---- Admin check ----
  public query ({ caller }) func isCallerAdmin() : async Bool {
    isAdmin(caller);
  };

  // ---- Episode CRUD ----
  public shared ({ caller }) func createEpisode(input : EpisodeInput) : async Nat {
    requireAdmin(caller);
    let id = nextId;
    nextId += 1;
    let episode : Episode = {
      id;
      title = input.title;
      description = input.description;
      showNotes = input.showNotes;
      publishedDate = input.publishedDate;
      duration = input.duration;
      audioFileId = input.audioFileId;
      artworkFileId = input.artworkFileId;
      published = input.published;
      explicit = input.explicit;
      createdAt = Time.now();
    };
    _episodes.add(id, episode);
    id;
  };

  public shared ({ caller }) func updateEpisode(id : Nat, input : EpisodeInput) : async Bool {
    requireAdmin(caller);
    switch (_episodes.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : Episode = {
          id;
          title = input.title;
          description = input.description;
          showNotes = input.showNotes;
          publishedDate = input.publishedDate;
          duration = input.duration;
          audioFileId = input.audioFileId;
          artworkFileId = input.artworkFileId;
          published = input.published;
          explicit = input.explicit;
          createdAt = existing.createdAt;
        };
        _episodes.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteEpisode(id : Nat) : async Bool {
    requireAdmin(caller);
    switch (_episodes.get(id)) {
      case (null) { false };
      case (?_) {
        _episodes.remove(id);
        true;
      };
    };
  };

  public query func getEpisode(id : Nat) : async ?Episode {
    switch (_episodes.get(id)) {
      case (null) { null };
      case (?ep) { if (ep.published) { ?ep } else { null } };
    };
  };

  public query func getEpisodes() : async [Episode] {
    episodesToArray().filter(func(ep : Episode) : Bool { ep.published });
  };

  public shared query ({ caller }) func getAllEpisodes() : async [Episode] {
    requireAdmin(caller);
    episodesToArray();
  };

  // ---- Podcast Info ----
  public shared ({ caller }) func setPodcastInfo(info : PodcastInfo) : async () {
    requireAdmin(caller);
    podcastInfo := info;
  };

  public query func getPodcastInfo() : async PodcastInfo {
    podcastInfo;
  };

  // ---- RSS Feed ----
  public shared func getRssFeed() : async Text {
    let info = podcastInfo;
    let selfId = Prim.getSelfPrincipal<system>().toText();
    let published = episodesToArray().filter(func(ep : Episode) : Bool { ep.published });

    var items = "";
    for (ep in published.vals()) {
      let audioUrl = "https://" # selfId # ".icp0.io/" # ep.audioFileId;
      let artworkUrl = if (ep.artworkFileId == "") { "" } else {
        "https://" # selfId # ".icp0.io/" # ep.artworkFileId;
      };
      let explicitTag = if (ep.explicit) { "yes" } else { "no" };
      items #= "<item>";
      items #= "<title>" # ep.title # "</title>";
      items #= "<description><![CDATA[" # ep.description # "]]></description>";
      items #= "<enclosure url=\"" # audioUrl # "\" type=\"audio/mpeg\" />";
      items #= "<pubDate>" # ep.publishedDate # "</pubDate>";
      items #= "<itunes:duration>" # ep.duration # "</itunes:duration>";
      items #= "<itunes:explicit>" # explicitTag # "</itunes:explicit>";
      if (artworkUrl != "") {
        items #= "<itunes:image href=\"" # artworkUrl # "\" />";
      };
      items #= "<guid>" # ep.id.toText() # "</guid>";
      items #= "</item>";
    };

    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" #
    "<rss version=\"2.0\" xmlns:itunes=\"http://www.itunes.com/dtds/podcast-1.0.dtd\">" #
    "<channel>" #
    "<title>" # info.stationName # "</title>" #
    "<description>" # info.description # "</description>" #
    "<link>" # info.websiteUrl # "</link>" #
    "<language>" # info.language # "</language>" #
    "<itunes:author>" # info.author # "</itunes:author>" #
    "<itunes:category text=\"" # info.category # "\" />" #
    items #
    "</channel>" #
    "</rss>";
  };
}
