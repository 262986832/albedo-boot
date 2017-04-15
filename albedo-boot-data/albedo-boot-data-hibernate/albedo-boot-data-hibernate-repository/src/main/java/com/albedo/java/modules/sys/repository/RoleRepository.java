package com.albedo.java.modules.sys.repository;

import com.albedo.java.common.repository.DataRepository;
import com.albedo.java.modules.sys.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * Spring Data JPA repository for the Authority entity.
 */
public interface RoleRepository extends DataRepository<Role, String> {

}
