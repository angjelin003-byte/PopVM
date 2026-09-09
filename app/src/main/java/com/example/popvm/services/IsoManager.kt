package com.example.popvm.services

import com.example.popvm.models.DistroPreset
import com.example.popvm.models.IsoInfo

object IsoManager {
    val PRESET_DISTROS = listOf(
        DistroPreset(
            id = "popos",
            name = "Pop!_OS 24.04 LTS",
            description = "Fast modern Linux desktop powered by COSMIC Desktop",
            desktopEnv = "COSMIC Desktop",
            size = "2.8 GB",
            arch = "ARM64 (aarch64)",
            defaultIsoPath = "/data/user/0/com.example.popvm/files/pop-os-arm64.iso"
        ),
        DistroPreset(
            id = "alpine",
            name = "Alpine Linux 3.20 (GUI)",
            description = "Ultra-lightweight Linux distribution with XFCE/Sway desktop",
            desktopEnv = "XFCE / Sway",
            size = "210 MB",
            arch = "ARM64 (aarch64)",
            defaultIsoPath = "/data/user/0/com.example.popvm/files/alpine-standard-arm64.iso"
        ),
        DistroPreset(
            id = "ubuntu",
            name = "Ubuntu 24.04 LTS Desktop",
            description = "Standard enterprise Linux desktop with GNOME Shell",
            desktopEnv = "GNOME Desktop",
            size = "3.2 GB",
            arch = "ARM64 (aarch64)",
            defaultIsoPath = "/data/user/0/com.example.popvm/files/ubuntu-desktop-arm64.iso"
        ),
        DistroPreset(
            id = "debian",
            name = "Debian 12 Bookworm",
            description = "Rock-solid Linux workstation with lightweight XFCE desktop",
            desktopEnv = "XFCE Desktop",
            size = "680 MB",
            arch = "ARM64 (aarch64)",
            defaultIsoPath = "/data/user/0/com.example.popvm/files/debian-12-arm64.iso"
        ),
        DistroPreset(
            id = "arch",
            name = "Arch Linux ARM",
            description = "Bleeding edge rolling release with Wayland desktop environment",
            desktopEnv = "Wayland Desktop",
            size = "890 MB",
            arch = "ARM64 (aarch64)",
            defaultIsoPath = "/data/user/0/com.example.popvm/files/archlinux-arm64.iso"
        )
    )

    fun getDefaultIso(): DistroPreset = PRESET_DISTROS[0]

    fun searchDistros(query: String): List<DistroPreset> {
        if (query.isBlank()) return PRESET_DISTROS
        val q = query.lowercase().trim()
        return PRESET_DISTROS.filter {
            it.name.lowercase().contains(q) ||
            it.description.lowercase().contains(q) ||
            it.desktopEnv.lowercase().contains(q)
        }
    }

    fun getIsoInfo(distro: DistroPreset): IsoInfo {
        return IsoInfo(
            name = distro.defaultIsoPath.substringAfterLast("/"),
            path = distro.defaultIsoPath,
            size = distro.size,
            arch = distro.arch,
            status = "Ready to Boot"
        )
    }
}
