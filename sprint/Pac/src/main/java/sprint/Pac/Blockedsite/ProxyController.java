package sprint.Pac.Blockedsite;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/proxy")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") // Adjust origin if needed
public class ProxyController {

    @Autowired
    private BlockedSiteRepository repository;

    @Autowired
    private FocusStateService focusStateService;

    // ==========================================
    // 1. REACT API ENDPOINTS (Manage Sites & Timer)
    // ==========================================

    @GetMapping("/sites/{userId}")
    public ResponseEntity<List<BlockedSite>> getSites(@PathVariable Long userId) {
        return ResponseEntity.ok(repository.findByUserId(userId));
    }

    @PostMapping("/sites")
    public ResponseEntity<BlockedSite> addSite(@RequestBody BlockedSite site) {
        return ResponseEntity.ok(repository.save(site));
    }

    @DeleteMapping("/sites/{id}")
    public ResponseEntity<?> deleteSite(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/start/{userId}")
    public ResponseEntity<?> startFocus(@PathVariable Long userId) {
        focusStateService.startFocus(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/stop/{userId}")
    public ResponseEntity<?> stopFocus(@PathVariable Long userId) {
        focusStateService.stopFocus(userId);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // 2. THE OS PROXY ENDPOINT (The Magic PAC File)
    // ==========================================

    @GetMapping(value = "/pac/{userId}", produces = "application/x-ns-proxy-autoconfig")
    public ResponseEntity<String> getPacFile(@PathVariable Long userId) {
        boolean isFocusing = focusStateService.isFocusActive(userId);

        // If Focus Mode is OFF, return a script that tells the OS to allow all traffic normally.
        if (!isFocusing) {
            String pacContent = "function FindProxyForURL(url, host) { return \"DIRECT\"; }";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"proxy.pac\"")
                    .body(pacContent);
        }

        // If Focus Mode is ON, get the user's blocked sites
        List<BlockedSite> sites = repository.findByUserId(userId);

        // Format the sites into a Javascript array string: ["youtube.com", "facebook.com"]
        String siteArray = sites.stream()
                .map(s -> "\"" + s.getUrl().replace("https://", "").replace("http://", "").replace("www.", "") + "\"")
                .collect(Collectors.joining(", "));

        // Generate the Javascript code that runs inside the user's network layer
        String pacContent = """
            function FindProxyForURL(url, host) {
                var blockedSites = [%s];
                
                for (var i = 0; i < blockedSites.length; i++) {
                    // Check if the website the user is trying to visit matches a blocked site
                    if (shExpMatch(host, "*" + blockedSites[i] + "*")) {
                        // Route blocked traffic to a dead end (localhost port 9)
                        return "PROXY 127.0.0.1:9"; 
                    }
                }
                
                // Allow all other traffic
                return "DIRECT"; 
            }
            """.formatted(siteArray);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"proxy.pac\"")
                .body(pacContent);
    }
}