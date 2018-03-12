package com.albedo.java.modules.sys.repository;

import com.albedo.java.common.persistence.repository.BaseRepository;
import com.albedo.java.modules.sys.domain.PersistentAuditEvent;
import com.baomidou.mybatisplus.mapper.BaseMapper;

/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */
public interface PersistenceAuditEventRepository extends BaseRepository<PersistentAuditEvent, Long> {

}
