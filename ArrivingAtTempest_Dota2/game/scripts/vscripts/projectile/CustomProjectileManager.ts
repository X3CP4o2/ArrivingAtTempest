import type { CustomAbility } from '../customstats/CustomAbility';
import { AbilityMechanicHookName } from '../shared/enums';

export enum ProjectileType {
    LINEAR,
    TRACKING
}

export enum ProjectileDeathType {
    HIT,
    DURATION,
    DISTANCE
}

export enum ProjectileVisionType {
    RADIUS,
    CUSTOM
}

interface ProjectileDeathConfig {
    [ProjectileDeathType.HIT]: number;
    [ProjectileDeathType.DURATION]: number;
    [ProjectileDeathType.DISTANCE]: number;
}

export interface ProjectileData {
    id: ProjectileID;
    particleId: ParticleID;
    createOptions: ProjectileCreateOptions;

    position: Vector;
    direction: Vector;
    speed: number;
    acceleration: number;

    deathCounters: ProjectileDeathConfig;
    affectingModificators: number[];

    abilityMetaInfo: any;
}

export interface ProjectileCreateOptions {
    ability: CustomAbility;
    source: CDOTA_BaseNPC;
    type: ProjectileType;
    deathTypes: Partial<ProjectileDeathConfig>;
    canBeAffectedByModificators?: boolean;
    effectPath: string;
    provideVision?: boolean;
    visionType?: ProjectileVisionType
    visionRadius?: number;
    visionTeam?: DOTATeam_t;
    origin: Vector;
    direction: Vector;
    acceleration?: number;
    maxSpeed?: number;
    startRadius: number;
    endRadius?: number;
    unitTargetTeam?: DOTA_UNIT_TARGET_TEAM;
    unitTargetFlags?: DOTA_UNIT_TARGET_FLAGS;
    unitTargetType?: DOTA_UNIT_TARGET_TYPE;
    ignoreSource?: boolean;
    target?: CDOTA_BaseNPC;
    speed: number;
    replaceExisting?: boolean;
    ignoreObstructions?: boolean;
}

interface ProjectileModificators {
    func: Function;
    params: object;
}

const DURATION_MAX = 120;
const HIT_MAX = 9999;
const DISTANCE_MAX = 16000;
const SPEED_MAX = 9999;

class Manager {
    projectiles: Record<number, ProjectileData> = {};

    modificators: ProjectileModificators[] = [];

    private CreateDotaProjectileOptions(options: ProjectileCreateOptions): CreateLinearProjectileOptions {
        return {
            Ability: options.ability,
            Source: options.source,
            bProvidesVision: options.provideVision,
            iVisionRadius: options.visionType === ProjectileVisionType.RADIUS ? options.visionRadius : options.endRadius,
            iVisionTeamNumber: options.visionTeam,
            vSpawnOrigin: options.origin,
            vVelocity: options.direction.__mul(options.speed),
            vAcceleration: options.direction.__mul(options.acceleration!),
            fMaxSpeed: options.maxSpeed,
            fDistance: options.deathTypes[ProjectileDeathType.DISTANCE],
            fStartRadius: options.startRadius,
            fEndRadius: options.endRadius,
            fExpireTime: options.deathTypes[ProjectileDeathType.DURATION],
            iUnitTargetType: options.unitTargetType,
            iUnitTargetTeam: options.unitTargetTeam,
            iUnitTargetFlags: options.unitTargetFlags,
            bIgnoreSource: options.ignoreSource
        }
    }

    private CreateParticle(options: ProjectileCreateOptions): ParticleID {
        const particleId = ParticleManager.CreateParticle(options.effectPath, ParticleAttachment_t.PATTACH_ABSORIGIN, undefined);
        ParticleManager.SetParticleControl(particleId, 0, options.origin);
        ParticleManager.SetParticleControl(particleId, 1, options.direction);
        ParticleManager.SetParticleControl(particleId, 2, options.direction.__mul(options.speed));
        return particleId;
    }

    private UpdateParticle(projectileData: ProjectileData) {
        ParticleManager.SetParticleControl(projectileData.particleId, 0, projectileData.position);
        ParticleManager.SetParticleControl(projectileData.particleId, 1, projectileData.direction);
        ParticleManager.SetParticleControl(projectileData.particleId, 2, projectileData.direction.__mul(projectileData.speed));
    }

    private DestroyProjectilesForAbility(ability: CustomAbility) {
        for (let [_, value] of pairs(this.projectiles)) {
            if (value.createOptions.ability === ability) {
                this.ProjectileEnded(value.id);
            }
        }
    }

    CreateProjectile(options: ProjectileCreateOptions) {
        if (options.startRadius && !options.endRadius) {
            options.endRadius = options.startRadius
        }

        options.ignoreSource = options.ignoreSource === undefined || options.ignoreSource;
        options.ignoreObstructions = options.ignoreObstructions === undefined || options.ignoreObstructions;
        options.replaceExisting = options.replaceExisting !== undefined || options.replaceExisting;
        options.canBeAffectedByModificators = options.canBeAffectedByModificators === undefined || options.canBeAffectedByModificators;
        options.provideVision = options.provideVision === undefined || options.provideVision;

        options.deathTypes[ProjectileDeathType.DURATION] = options.deathTypes[ProjectileDeathType.DURATION] || DURATION_MAX;
        options.deathTypes[ProjectileDeathType.DISTANCE] = options.deathTypes[ProjectileDeathType.DISTANCE] || DISTANCE_MAX;
        options.deathTypes[ProjectileDeathType.HIT] = options.deathTypes[ProjectileDeathType.HIT] || HIT_MAX;

        options.maxSpeed = options.maxSpeed || SPEED_MAX;
        options.acceleration = options.acceleration || 1;

        if (options.replaceExisting) {
            this.DestroyProjectilesForAbility(options.ability);
        }

        const projectileId = ProjectileManager.CreateLinearProjectile(this.CreateDotaProjectileOptions(options));

        print("CreateProjectile", projectileId);

        const projectileData: ProjectileData = {
            id: projectileId,
            createOptions: options,
            deathCounters: {
                [ProjectileDeathType.HIT]: options.deathTypes[ProjectileDeathType.HIT]!,
                [ProjectileDeathType.DURATION]: options.deathTypes[ProjectileDeathType.DURATION]!,
                [ProjectileDeathType.DISTANCE]: options.deathTypes[ProjectileDeathType.DISTANCE]!
            },
            affectingModificators: [],
            speed: options.speed,
            direction: options.direction,
            position: options.origin,
            acceleration: options.acceleration,
            particleId: this.CreateParticle(options),
            abilityMetaInfo: {}
        };

        projectileData.createOptions.ability.HandleMechanicByName(AbilityMechanicHookName.OnProjectileStart, projectileData, false);

        this.projectiles[projectileId] = projectileData;
    }

    private CheckShouldKillProjectile(projectileData: ProjectileData) {
        return projectileData.deathCounters[ProjectileDeathType.DISTANCE] <= 0 || projectileData.deathCounters[ProjectileDeathType.DURATION] <= 0;
    }

    ProjectileUpdate(id: ProjectileID) {
        if (!ProjectileManager.IsValidProjectile(id)) {
            return;
        }

        // print("ProjectileUpdate", id);
        const projectileData = this.projectiles[id];

        const originalPosition = ProjectileManager.GetLinearProjectileLocation(id);
        
        if(!projectileData.createOptions.ignoreObstructions && !GridNav.IsTraversable(originalPosition)){
            this.ProjectileEnded(id);
            return;
        }

        const originalVelocity = ProjectileManager.GetLinearProjectileVelocity(id);

        projectileData.deathCounters[ProjectileDeathType.DURATION] -= FrameTime();
        projectileData.deathCounters[ProjectileDeathType.DISTANCE] -= originalPosition.__sub(projectileData.position).Length2D();

        projectileData.direction = originalVelocity.Normalized();
        projectileData.position = originalPosition;

        if (this.CheckShouldKillProjectile(projectileData)) {
            this.ProjectileEnded(id);
            return;
        }

        projectileData.createOptions.ability.HandleMechanicByName(AbilityMechanicHookName.OnProjectileProgress, projectileData);

        this.modificators.forEach(modificator => {
            modificator.func(projectileData, modificator.params);
        });

        ProjectileManager.UpdateLinearProjectileDirection(id, projectileData.direction.__mul(projectileData.speed), projectileData.speed);

        this.UpdateParticle(projectileData);
    }

    ProjectileHit(id: ProjectileID, target: CDOTA_BaseNPC, location?: Vector) {
        if (!ProjectileManager.IsValidProjectile(id)) {
            return;
        }
        print("ProjectileHit", id);

        const projectileData = this.projectiles[id];

        projectileData.deathCounters[ProjectileDeathType.HIT] -= 1;

        projectileData.createOptions.ability.HandleMechanicByName(AbilityMechanicHookName.OnProjectileHit, projectileData);

        return projectileData.deathCounters[ProjectileDeathType.HIT] <= 0;
    }

    ProjectileEnded(id: ProjectileID, location?: Vector) {
        if (!ProjectileManager.IsValidProjectile(id)) {
            return;
        }

        print("ProjectileEnded", id);

        const projectileData = this.projectiles[id];

        projectileData.createOptions.ability.HandleMechanicByName(AbilityMechanicHookName.OnProjectileFinish, projectileData);

        this.DestroyProjectile(id);
    }

    DestroyProjectile(id: ProjectileID) {
        ParticleManager.ReleaseParticleIndex(this.projectiles[id].particleId);
        ParticleManager.DestroyParticle(this.projectiles[id].particleId, false);

        if (ProjectileManager.IsValidProjectile(id)) {
            ProjectileManager.DestroyLinearProjectile(id);
        }

        if (this.projectiles[id]) {
            delete this.projectiles[id];
        }
    }
}

export const CustomProjectileManager = new Manager();