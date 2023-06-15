import {Resolver, ResolveOptions, MinimalResolveOptions, Descriptor, Locator, miscUtils, structUtils, Package, LinkType, Manifest} from "@yarnpkg/core"
import {Event, relayInit, nip19} from "nostr-tools";

export class dpmResolver implements Resolver {
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean {
        console.log("fuckf")
        return descriptor.range.startsWith("dpm:")
    }

    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean {
        console.log(locator)
        return true
    }

    async getCandidates(descriptor: Descriptor, dependencies: Record<string, Package>, opts: ResolveOptions): Promise<Array<Locator>> {
        return [structUtils.convertDescriptorToLocator(descriptor)]
    }

    async getSatisfying(descriptor: Descriptor, dependencies: Record<string, Package>, locators: Array<Locator>, opts: ResolveOptions): Promise<{
        locators: Array<Locator>;
        sorted: boolean
    }> {
        const [locator] = await this.getCandidates(descriptor, dependencies, opts);

        return {
            locators: locators.filter(candidate => candidate.locatorHash === locator.locatorHash),
            sorted: false,
        };
    }

    async resolve(locator: Locator, opts: ResolveOptions): Promise<Package> {
        if (!opts.fetchOptions)
            throw new Error(`Assertion failed: This resolver cannot be used unless a fetcher is configured`);

        const packageFetch = await opts.fetchOptions.fetcher.fetch(locator, opts.fetchOptions);

        const manifest = await miscUtils.releaseAfterUseAsync(async () => {
            return await Manifest.find(packageFetch.prefixPath, {baseFs: packageFetch.packageFs});
        }, packageFetch.releaseFs);

        return {
            ...locator,

            version: manifest.version || `0.0.0`,

            languageName: manifest.languageName || opts.project.configuration.get(`defaultLanguageName`),
            linkType: LinkType.HARD,

            conditions: manifest.getConditions(),

            dependencies: opts.project.configuration.normalizeDependencyMap(manifest.dependencies),
            peerDependencies: manifest.peerDependencies,

            dependenciesMeta: manifest.dependenciesMeta,
            peerDependenciesMeta: manifest.peerDependenciesMeta,

            bin: manifest.bin,
        };
    }

    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean {
        return true
    }

    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor {
        return descriptor
    }

    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): Record<string, Descriptor> {
        return {}
    }

    async fetchEventFromNostr(locator: Locator) {
        const fields = locator.reference.split(":")
        if (fields[0] == "dpm")
            fields.shift()
        const decoded = nip19.decode(fields[0])
        if (decoded.type != "naddr")
            throw new Error("not valid ref")
        const r = relayInit("wss://relay.damus.io")
        r.on("connect", () => {
            console.log("Connected")
        })
        await r.connect()
        const sub = r.sub([
            {
                kinds: [30242],
                "#a": ["30241:" + decoded.data.pubkey + ":" + decoded.data.identifier],
                "#ver": [fields[1]]
            }
        ])
        let pkg: Event | null = null;
        sub.on("event", (event: Event) => {
            pkg = event
        })
        const findTag = (name: string): string[] | undefined => {
            if (pkg)
                return pkg.tags.find((t) => t[0] == name)
        }

        return pkg
    }
}