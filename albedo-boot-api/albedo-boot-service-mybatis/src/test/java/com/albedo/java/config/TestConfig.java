/*
 *
 *   Copyright 2016 the original author or authors.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

package com.albedo.java.config;

import com.baomidou.mybatisplus.MybatisSessionFactoryBuilder;
import com.baomidou.mybatisplus.entity.GlobalConfiguration;
import com.baomidou.mybatisplus.spring.boot.starter.ConfigurationCustomizer;
import com.baomidou.mybatisplus.spring.boot.starter.MybatisPlusAutoConfiguration;
import com.baomidou.mybatisplus.spring.boot.starter.MybatisPlusProperties;
import com.baomidou.mybatisplus.toolkit.GlobalConfigUtils;
import com.zaxxer.hikari.HikariDataSource;
import org.apache.ibatis.mapping.DatabaseIdProvider;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.AuditorAware;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabase;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

/**
 * Created by songjiawei on 2016/11/9.
 */
@Configuration
@ComponentScan({"com.albedo.java.*"})
@EnableTransactionManagement
@MapperScan("com.albedo.java.modules.*.repository")
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableConfigurationProperties({MybatisPlusProperties.class})
public class TestConfig extends MybatisPlusAutoConfiguration  {


    public TestConfig(MybatisPlusProperties properties, ObjectProvider<Interceptor[]> interceptorsProvider, ResourceLoader resourceLoader, ObjectProvider<DatabaseIdProvider> databaseIdProvider, ObjectProvider<List<ConfigurationCustomizer>> configurationCustomizersProvider) {
        super(properties, interceptorsProvider, resourceLoader, databaseIdProvider, configurationCustomizersProvider);
    }

    @Bean
    public DataSource dataSource() {
        EmbeddedDatabase embeddedDatabase = new EmbeddedDatabaseBuilder().setType(EmbeddedDatabaseType.H2)
            .addScript("classpath:/test-init.sql").build();
        return new LazyConnectionDataSourceProxy(embeddedDatabase);
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    @Bean
    public AuditorAware<String> auditorAware() {
        return new AuditorAware<String>() {
            @Override
            public String getCurrentAuditor() {
                return "1";
            }
        };
    }

//    public GlobalConfiguration globalConfiguration() {
//        GlobalConfiguration global = GlobalConfigUtils.defaults();
//        // global.setAutoSetDbType(true);
//        // 设置全局校验机制为FieldStrategy.Empty
//        global.setFieldStrategy(2);
//        return global;
//    }
//
//    @Bean
//    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) {
//        return sqlSessionFactory("mysql-config.xml", dataSource);
//    }
//
//    public SqlSessionFactory sqlSessionFactory(String configXml, DataSource dataSource) {
//        GlobalConfiguration global = this.globalConfiguration();
////        HikariDataSource hikariDataSource = new HikariDataSource();`
////        hikariDataSource.setDataSource(dataSource);
////        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
////        dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/mybatis-plus?characterEncoding=UTF-8");
////        dataSource.setUsername("root");
////        dataSource.setPassword("521");`
////        dataSource.setM(1000);
//        GlobalConfigUtils.setMetaData(dataSource, global);
//        // 加载配置文件
//        InputStream inputStream = TestConfig.class.getClassLoader().getResourceAsStream(configXml);
//        MybatisSessionFactoryBuilder factoryBuilder = new MybatisSessionFactoryBuilder();
//        factoryBuilder.setGlobalConfig(global);
//        return factoryBuilder..build(inputStream);
//    }
}
